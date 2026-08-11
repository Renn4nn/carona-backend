import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import type {
  CancelRideParticipantSchema,
  CreateRideParticipantSchema,
  RideParticipationQuerySchema,
} from 'src/utils/schemas/ride-participant.schema';
import {
  MY_RIDE_PARTICIPATION_SELECT,
  RIDE_PARTICIPANT_SELECT,
} from 'src/utils/selects';
import {
  PARTICIPANT_STATUS,
  RIDE_STATUS,
} from 'src/module/ride/ride.constants';

class AtomicParticipationConflictError extends Error {}

@Injectable()
export class RideParticipantRepository {
  constructor(@Inject('PrismaService') private readonly prisma: PrismaClient) {}

  findByRideAndUser(rideId: string, userId: string) {
    return this.prisma.rideParticipant.findUnique({
      where: { rideId_userId: { rideId, userId } },
      select: RIDE_PARTICIPANT_SELECT,
    });
  }

  findById(id: string) {
    return this.prisma.rideParticipant.findUnique({
      where: { id },
      select: RIDE_PARTICIPANT_SELECT,
    });
  }

  findByRide(rideId: string) {
    return this.prisma.rideParticipant.findMany({
      where: { rideId },
      orderBy: { requestedAt: 'asc' },
      select: RIDE_PARTICIPANT_SELECT,
    });
  }

  findMine(userId: string, query: RideParticipationQuerySchema) {
    return this.prisma.rideParticipant.findMany({
      where: { userId },
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : undefined,
      take: query.limit + 1,
      select: MY_RIDE_PARTICIPATION_SELECT,
    });
  }

  create(
    rideId: string,
    userId: string,
    statusId: string,
    data: CreateRideParticipantSchema,
  ) {
    return this.prisma.rideParticipant.create({
      data: { rideId, userId, statusId, ...data },
      select: RIDE_PARTICIPANT_SELECT,
    });
  }

  async accept(
    rideId: string,
    participantId: string,
    acceptedStatusId: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const participant = await tx.rideParticipant.updateMany({
          where: {
            id: participantId,
            rideId,
            status: { code: PARTICIPANT_STATUS.PENDING },
          },
          data: { statusId: acceptedStatusId, respondedAt: new Date() },
        });
        if (participant.count !== 1) {
          throw new AtomicParticipationConflictError();
        }

        const ride = await tx.ride.updateMany({
          where: {
            id: rideId,
            status: { code: RIDE_STATUS.OPEN },
            availableSeats: { gt: 0 },
          },
          data: { availableSeats: { decrement: 1 } },
        });
        if (ride.count !== 1) {
          throw new AtomicParticipationConflictError();
        }

        return tx.rideParticipant.findUnique({
          where: { id: participantId },
          select: RIDE_PARTICIPANT_SELECT,
        });
      });
    } catch (error) {
      if (error instanceof AtomicParticipationConflictError) return null;
      throw error;
    }
  }

  async reject(rideId: string, participantId: string, statusId: string) {
    const updated = await this.prisma.rideParticipant.updateMany({
      where: {
        id: participantId,
        rideId,
        status: { code: PARTICIPANT_STATUS.PENDING },
      },
      data: { statusId, respondedAt: new Date() },
    });
    if (updated.count !== 1) return null;
    return this.findById(participantId);
  }

  async cancelPending(
    rideId: string,
    userId: string,
    statusId: string,
    data: CancelRideParticipantSchema,
  ) {
    const updated = await this.prisma.rideParticipant.updateMany({
      where: {
        rideId,
        userId,
        status: { code: PARTICIPANT_STATUS.PENDING },
      },
      data: {
        statusId,
        canceledAt: new Date(),
        cancellationReason: data.reason,
      },
    });
    if (updated.count !== 1) return null;
    return this.findByRideAndUser(rideId, userId);
  }

  async cancelAccepted(
    rideId: string,
    userId: string,
    statusId: string,
    data: CancelRideParticipantSchema,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const participant = await tx.rideParticipant.updateMany({
          where: {
            rideId,
            userId,
            status: { code: PARTICIPANT_STATUS.ACCEPTED },
          },
          data: {
            statusId,
            canceledAt: new Date(),
            cancellationReason: data.reason,
          },
        });
        if (participant.count !== 1) {
          throw new AtomicParticipationConflictError();
        }

        const ride = await tx.ride.updateMany({
          where: {
            id: rideId,
            status: { code: RIDE_STATUS.OPEN },
          },
          data: { availableSeats: { increment: 1 } },
        });
        if (ride.count !== 1) {
          throw new AtomicParticipationConflictError();
        }

        return tx.rideParticipant.findUnique({
          where: { rideId_userId: { rideId, userId } },
          select: RIDE_PARTICIPANT_SELECT,
        });
      });
    } catch (error) {
      if (error instanceof AtomicParticipationConflictError) return null;
      throw error;
    }
  }
}
