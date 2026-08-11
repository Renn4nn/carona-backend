import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { participantStatusSchema } from './participant-status.schema';
import { publicRideSchema } from './ride.schema';

export const createRideParticipantSchema = z.strictObject({
  message: z.string().trim().max(500).optional(),
});

export const cancelRideParticipantSchema = z.strictObject({
  reason: z.string().trim().min(3).max(500).optional(),
});

export const rideParticipationQuerySchema = z.strictObject({
  cursor: z.uuid({ error: 'Cursor inválido' }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const rideParticipantSchema = z.strictObject({
  id: z.uuid(),
  rideId: z.uuid(),
  userId: z.uuid(),
  user: z.strictObject({ id: z.uuid(), login: z.string() }),
  status: participantStatusSchema,
  message: z.string().nullable(),
  requestedAt: z.iso.datetime({ offset: true }),
  respondedAt: z.iso.datetime({ offset: true }).nullable(),
  canceledAt: z.iso.datetime({ offset: true }).nullable(),
  completedAt: z.iso.datetime({ offset: true }).nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const myRideParticipationSchema = rideParticipantSchema.extend({
  ride: publicRideSchema,
});

export type CreateRideParticipantSchema = z.infer<
  typeof createRideParticipantSchema
>;
export type CancelRideParticipantSchema = z.infer<
  typeof cancelRideParticipantSchema
>;
export type RideParticipantSchema = z.infer<typeof rideParticipantSchema>;
export type MyRideParticipationSchema = z.infer<
  typeof myRideParticipationSchema
>;

export class CreateRideParticipantDto extends createZodDto(
  createRideParticipantSchema,
) {}
export class CancelRideParticipantDto extends createZodDto(
  cancelRideParticipantSchema,
) {}
export class RideParticipantDto extends createZodDto(rideParticipantSchema) {}
export class RideParticipationQueryDto extends createZodDto(
  rideParticipationQuerySchema,
) {}
export type RideParticipationQuerySchema = z.infer<
  typeof rideParticipationQuerySchema
>;
