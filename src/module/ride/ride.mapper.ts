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
    originName: ride.originName,
    destinationName: ride.destinationName,
    departureAt: ride.departureAt.toISOString(),
    estimatedArrivalAt: ride.estimatedArrivalAt?.toISOString() ?? null,
    totalSeats: ride.totalSeats,
    availableSeats: ride.availableSeats,
    isFull: ride.availableSeats === 0,
    contributionPerSeat: ride.contributionPerSeat.toFixed(2),
    paymentMethod: ride.paymentMethod as PublicRideSchema['paymentMethod'],
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
    originAddress: ride.originAddress,
    originLatitude: ride.originLatitude?.toNumber() ?? null,
    originLongitude: ride.originLongitude?.toNumber() ?? null,
    destinationAddress: ride.destinationAddress,
    destinationLatitude: ride.destinationLatitude?.toNumber() ?? null,
    destinationLongitude: ride.destinationLongitude?.toNumber() ?? null,
    paymentNotes: ride.paymentNotes,
    description: ride.description,
    rules: ride.rules,
    startedAt: ride.startedAt?.toISOString() ?? null,
    completedAt: ride.completedAt?.toISOString() ?? null,
    canceledAt: ride.canceledAt?.toISOString() ?? null,
    cancellationReason: ride.cancellationReason,
    createdAt: ride.createdAt.toISOString(),
    updatedAt: ride.updatedAt.toISOString(),
  };
}
