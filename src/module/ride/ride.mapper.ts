import type { Prisma } from 'generated/prisma/client';
import type {
  PublicRideSchema,
  RideSchema,
} from 'src/utils/schemas/ride.schema';
import { RIDE_DETAIL_SELECT, RIDE_PUBLIC_SELECT } from 'src/utils/selects';

export type PublicRideRecord = Prisma.RideGetPayload<{
  select: typeof RIDE_PUBLIC_SELECT;
}>;

export type RideDetailRecord = Prisma.RideGetPayload<{
  select: typeof RIDE_DETAIL_SELECT;
}>;

export function mapPublicRide(ride: PublicRideRecord): PublicRideSchema {
  return {
    id: ride.id,
    status: ride.status as PublicRideSchema['status'],
    originAddress: ride.originAddress,
    destinationAddress: ride.destinationAddress,
    departureAt: ride.departureAt.toISOString(),
    estimatedArrivalAt: ride.estimatedArrivalAt?.toISOString() ?? null,
    totalSeats: ride.totalSeats,
    availableSeats: ride.availableSeats,
    isFull: ride.availableSeats === 0,
  };
}

export function mapRide(ride: RideDetailRecord): RideSchema {
  return {
    ...mapPublicRide(ride),
    driver: ride.driver,
    vehicle: {
      id: ride.vehicle.id,
      brand: ride.vehicle.brand,
      model: ride.vehicle.model,
      color: ride.vehicle.color,
      year: ride.vehicle.year,
    },
    originLatitude: ride.originLatitude?.toNumber() ?? null,
    originLongitude: ride.originLongitude?.toNumber() ?? null,
    destinationLatitude: ride.destinationLatitude?.toNumber() ?? null,
    destinationLongitude: ride.destinationLongitude?.toNumber() ?? null,
    notes: ride.notes,
    startedAt: ride.startedAt?.toISOString() ?? null,
    completedAt: ride.completedAt?.toISOString() ?? null,
    canceledAt: ride.canceledAt?.toISOString() ?? null,
    cancellationReason: ride.cancellationReason,
    createdAt: ride.createdAt.toISOString(),
    updatedAt: ride.updatedAt.toISOString(),
  };
}
