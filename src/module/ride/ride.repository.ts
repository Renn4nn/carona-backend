import { Inject, Injectable } from '@nestjs/common';
import { Prisma, type PrismaClient } from 'generated/prisma/client';
import type {
  CreateRideSchema,
  NearbyRideQuerySchema,
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
      originAddress: query.origin
        ? { contains: query.origin, mode: 'insensitive' }
        : undefined,
      destinationAddress: query.destination
        ? { contains: query.destination, mode: 'insensitive' }
        : undefined,
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

  findNearby(query: NearbyRideQuerySchema) {
    const radiusMeters = query.radiusKm * 1000;
    const latDelta = query.radiusKm / 111.32;
    const lonDelta =
      query.radiusKm /
      (111.32 * Math.max(Math.cos((query.latitude * Math.PI) / 180), 0.1));
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        driverId: string;
        login: string;
        departureAt: Date;
        availableSeats: number;
        originLatitude: number;
        originLongitude: number;
        distanceMeters: number;
      }>
    >(Prisma.sql`
      WITH nearby AS (
      SELECT r.id, r."driverId", u.login, r."departureAt", r."availableSeats",
        ROUND(r."originLatitude"::numeric, 3)::double precision AS "originLatitude",
        ROUND(r."originLongitude"::numeric, 3)::double precision AS "originLongitude",
        ROUND((6371000 * acos(LEAST(1, GREATEST(-1,
          sin(radians(${query.latitude})) * sin(radians(r."originLatitude"::double precision)) +
          cos(radians(${query.latitude})) * cos(radians(r."originLatitude"::double precision)) *
          cos(radians(r."originLongitude"::double precision) - radians(${query.longitude}))
        ))))::numeric)::integer AS "distanceMeters"
      FROM "Ride" r
      JOIN "User" u ON u.id = r."driverId"
      JOIN "RideStatus" rs ON rs.id = r."statusId"
      WHERE rs.code = 'OPEN' AND rs.active = true AND u.active = true
        AND r."departureAt" >= NOW() AND r."availableSeats" > 0
        AND r."originLatitude" IS NOT NULL AND r."originLongitude" IS NOT NULL
        AND r."originLatitude" BETWEEN ${query.latitude - latDelta} AND ${query.latitude + latDelta}
        AND r."originLongitude" BETWEEN ${query.longitude - lonDelta} AND ${query.longitude + lonDelta}
      )
      SELECT * FROM nearby
      WHERE "distanceMeters" <= ${radiusMeters}
      ORDER BY "distanceMeters" ASC, id ASC
      LIMIT 50
    `);
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

  findParticipantStatus(rideId: string, userId: string) {
    return this.prisma.rideParticipant.findUnique({
      where: { rideId_userId: { rideId, userId } },
      select: { status: { select: { code: true } } },
    });
  }

  countAccepted(id: string) {
    return this.prisma.rideParticipant.count({
      where: { rideId: id, status: { code: PARTICIPANT_STATUS.ACCEPTED } },
    });
  }

  create(
    driverId: string,
    statusId: string,
    totalSeats: number,
    data: CreateRideSchema,
  ) {
    return this.prisma.ride.create({
      data: {
        ...data,
        driverId,
        statusId,
        totalSeats,
        availableSeats: totalSeats,
      },
      select: RIDE_DETAIL_SELECT,
    });
  }

  update(
    id: string,
    data: UpdateRideSchema & {
      totalSeats?: number;
      availableSeats?: number;
    },
  ) {
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
