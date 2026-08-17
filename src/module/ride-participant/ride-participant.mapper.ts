import type { Prisma } from 'generated/prisma/client';
import { mapPublicRide } from 'src/module/ride/ride.mapper';
import type {
  MyRideParticipationSchema,
  RideParticipantSchema,
} from 'src/utils/schemas/ride-participant.schema';
import {
  MY_RIDE_PARTICIPATION_SELECT,
  RIDE_PARTICIPANT_SELECT,
} from 'src/utils/selects';

export type RideParticipantRecord = Prisma.RideParticipantGetPayload<{
  select: typeof RIDE_PARTICIPANT_SELECT;
}>;

export type MyRideParticipationRecord = Prisma.RideParticipantGetPayload<{
  select: typeof MY_RIDE_PARTICIPATION_SELECT;
}>;

export function mapRideParticipant(
  participant: RideParticipantRecord,
): RideParticipantSchema {
  return {
    id: participant.id,
    rideId: participant.rideId,
    userId: participant.userId,
    user: participant.user,
    status: participant.status as RideParticipantSchema['status'],
    message: participant.message,
    dropoffAddress: participant.dropoffAddress,
    dropoffLatitude: participant.dropoffLatitude?.toNumber() ?? null,
    dropoffLongitude: participant.dropoffLongitude?.toNumber() ?? null,
    distanceMeters: participant.distanceMeters,
    rideAmount: participant.rideAmount?.toFixed(2) ?? null,
    platformFee: participant.platformFee?.toFixed(2) ?? null,
    totalAmount: participant.totalAmount?.toFixed(2) ?? null,
    priceCalculatedAt: participant.priceCalculatedAt?.toISOString() ?? null,
    requestedAt: participant.requestedAt.toISOString(),
    respondedAt: participant.respondedAt?.toISOString() ?? null,
    canceledAt: participant.canceledAt?.toISOString() ?? null,
    completedAt: participant.completedAt?.toISOString() ?? null,
    cancellationReason: participant.cancellationReason,
    createdAt: participant.createdAt.toISOString(),
    updatedAt: participant.updatedAt.toISOString(),
  };
}

export function mapMyRideParticipation(
  participant: MyRideParticipationRecord,
): MyRideParticipationSchema {
  return {
    ...mapRideParticipant(participant),
    ride: mapPublicRide(participant.ride),
  };
}
