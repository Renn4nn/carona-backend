import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import type {
  CreateRideSchema,
  MineRideQuerySchema,
  RideQuerySchema,
  UpdateRideSchema,
} from 'src/utils/schemas/ride.schema';
import { RIDE_DETAIL_SELECT, RIDE_PUBLIC_SELECT } from 'src/utils/selects';
import { PARTICIPANT_STATUS, RIDE_STATUS } from './ride.constants';

@Injectable()
export class RideRepository {
  constructor(@Inject('PrismaService') private readonly prisma: PrismaClient) {}

  private buildSearchWhere(
    query: RideQuerySchema,
    publicSearch: boolean,
  ): Prisma.RideWhereInput {
    return {
      status: publicSearch
        ? { code: RIDE_STATUS.OPEN, active: true }
        : undefined,
      driver: publicSearch ? { active: true } : undefined,
      vehicle: publicSearch ? { active: true } : undefined,
      departureAt: {
        gte: query.departureFrom ?? (publicSearch ? new Date() : undefined),
        lte: query.departureTo,
      },
      originName: query.origin
        ? { contains: query.origin, mode: 'insensitive' }
        : undefined,
      destinationName: query.destination
        ? { contains: query.destination, mode: 'insensitive' }
        : undefined,
      contributionPerSeat:
        query.maxContribution === undefined
          ? undefined
          : { lte: query.maxContribution },
      availableSeats: query.availableOnly === 'true' ? { gt: 0 } : undefined,
    };
  }

  findPublicMany(query: RideQuerySchema) {
    return this.prisma.ride.findMany({
      where: this.buildSearchWhere(query, true),
      orderBy: [{ departureAt: 'asc' }, { id: 'asc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : undefined,
      take: query.limit + 1,
      select: RIDE_PUBLIC_SELECT,
    });
  }

  findMany(query: RideQuerySchema) {
    return this.prisma.ride.findMany({
      where: this.buildSearchWhere(query, true),
      orderBy: [{ departureAt: 'asc' }, { id: 'asc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : undefined,
      take: query.limit + 1,
      select: RIDE_DETAIL_SELECT,
    });
  }

  findMine(userId: string, query: MineRideQuerySchema) {
    const relationWhere: Prisma.RideWhereInput =
      query.role === 'driver'
        ? { driverId: userId }
        : { participants: { some: { userId } } };
    return this.prisma.ride.findMany({
      where: {
        ...this.buildSearchWhere(query, false),
        ...relationWhere,
      },
      orderBy: [{ departureAt: 'desc' }, { id: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : undefined,
      take: query.limit + 1,
      select: RIDE_DETAIL_SELECT,
    });
  }

  findPublicById(id: string) {
    return this.prisma.ride.findFirst({
      where: {
        id,
        status: { code: RIDE_STATUS.OPEN, active: true },
        driver: { active: true },
        vehicle: { active: true },
        departureAt: { gte: new Date() },
      },
      select: RIDE_PUBLIC_SELECT,
    });
  }

  findById(id: string) {
    return this.prisma.ride.findUnique({
      where: { id },
      select: RIDE_DETAIL_SELECT,
    });
  }

  countAccepted(id: string) {
    return this.prisma.rideParticipant.count({
      where: { rideId: id, status: { code: PARTICIPANT_STATUS.ACCEPTED } },
    });
  }

  create(driverId: string, statusId: string, data: CreateRideSchema) {
    return this.prisma.ride.create({
      data: {
        ...data,
        driverId,
        statusId,
        availableSeats: data.totalSeats,
      },
      select: RIDE_DETAIL_SELECT,
    });
  }

  update(id: string, data: UpdateRideSchema & { availableSeats?: number }) {
    return this.prisma.ride.update({
      where: { id },
      data,
      select: RIDE_DETAIL_SELECT,
    });
  }

  async start(id: string, driverId: string, statusId: string) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.ride.updateMany({
        where: { id, driverId, status: { code: RIDE_STATUS.OPEN } },
        data: { statusId, startedAt: new Date() },
      });
      if (updated.count !== 1) return null;
      return tx.ride.findUnique({ where: { id }, select: RIDE_DETAIL_SELECT });
    });
  }

  async complete(
    id: string,
    driverId: string,
    rideStatusId: string,
    participantStatusId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.ride.updateMany({
        where: { id, driverId, status: { code: RIDE_STATUS.IN_PROGRESS } },
        data: { statusId: rideStatusId, completedAt: now },
      });
      if (updated.count !== 1) return null;
      await tx.rideParticipant.updateMany({
        where: {
          rideId: id,
          status: { code: PARTICIPANT_STATUS.ACCEPTED },
        },
        data: { statusId: participantStatusId, completedAt: now },
      });
      return tx.ride.findUnique({ where: { id }, select: RIDE_DETAIL_SELECT });
    });
  }

  async cancel(
    id: string,
    driverId: string,
    reason: string,
    rideStatusId: string,
    participantStatusId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.ride.updateMany({
        where: {
          id,
          driverId,
          status: { code: { in: [RIDE_STATUS.OPEN, RIDE_STATUS.IN_PROGRESS] } },
        },
        data: {
          statusId: rideStatusId,
          canceledAt: now,
          cancellationReason: reason,
        },
      });
      if (updated.count !== 1) return null;
      await tx.rideParticipant.updateMany({
        where: {
          rideId: id,
          status: {
            code: {
              in: [PARTICIPANT_STATUS.PENDING, PARTICIPANT_STATUS.ACCEPTED],
            },
          },
        },
        data: {
          statusId: participantStatusId,
          canceledAt: now,
          cancellationReason: 'Carona cancelada pelo motorista.',
        },
      });
      return tx.ride.findUnique({ where: { id }, select: RIDE_DETAIL_SELECT });
    });
  }
}
