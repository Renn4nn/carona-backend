import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { rideStatusSchema } from './ride-status.schema';

const addressSchema = (field: string) =>
  z
    .string({ error: `Campo ${field} é obrigatório` })
    .trim()
    .min(5, `Campo ${field} deve ter pelo menos 5 caracteres`)
    .max(255, `Campo ${field} deve ter no máximo 255 caracteres`);

const latitudeSchema = z.number().min(-90).max(90).optional();
const longitudeSchema = z.number().min(-180).max(180).optional();
const isoDateTimeSchema = (message: string) =>
  z.iso.datetime({ offset: true, error: message });

const rideInputBaseSchema = z.strictObject({
  vehicleId: z.uuid({ error: 'Veículo inválido' }),
  originAddress: addressSchema('Endereço inicial'),
  originLatitude: latitudeSchema,
  originLongitude: longitudeSchema,
  destinationAddress: addressSchema('Endereço final'),
  destinationLatitude: latitudeSchema,
  destinationLongitude: longitudeSchema,
  departureAt: isoDateTimeSchema('Data de partida inválida'),
  notes: z.string().trim().max(1000).optional(),
});

function hasCoordinatePair(
  latitude: number | undefined,
  longitude: number | undefined,
) {
  return (latitude === undefined) === (longitude === undefined);
}

function validateCoordinates(
  data: z.infer<typeof rideInputBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (!hasCoordinatePair(data.originLatitude, data.originLongitude)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Latitude e longitude da origem devem ser informadas juntas',
      path: ['originLatitude'],
    });
  }
  if (!hasCoordinatePair(data.destinationLatitude, data.destinationLongitude)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Latitude e longitude do destino devem ser informadas juntas',
      path: ['destinationLatitude'],
    });
  }
}

export const createRideSchema =
  rideInputBaseSchema.superRefine(validateCoordinates);

export const updateRideSchema = rideInputBaseSchema.partial();

export const cancelRideSchema = z.strictObject({
  reason: z
    .string({ error: 'Motivo do cancelamento é obrigatório' })
    .trim()
    .min(3, 'Motivo do cancelamento deve ter pelo menos 3 caracteres')
    .max(500, 'Motivo do cancelamento deve ter no máximo 500 caracteres'),
});

export const rideQuerySchema = z.strictObject({
  cursor: z.uuid({ error: 'Cursor inválido' }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  origin: z.string().trim().min(1).max(255).optional(),
  destination: z.string().trim().min(1).max(255).optional(),
  departureFrom: isoDateTimeSchema('Data inicial inválida').optional(),
  departureTo: isoDateTimeSchema('Data final inválida').optional(),
  availableOnly: z.enum(['true', 'false']).default('true'),
});

export const mineRideQuerySchema = rideQuerySchema
  .omit({ availableOnly: true })
  .extend({
    availableOnly: z.enum(['true', 'false']).default('false'),
    role: z.enum(['driver', 'passenger']),
  });

const rideBaseResponseSchema = z.strictObject({
  id: z.uuid(),
  status: rideStatusSchema,
  originAddress: z.string(),
  destinationAddress: z.string(),
  departureAt: isoDateTimeSchema('Data de partida inválida'),
  estimatedArrivalAt: isoDateTimeSchema(
    'Data estimada de chegada inválida',
  ).nullable(),
  totalSeats: z.number().int(),
  availableSeats: z.number().int(),
  isFull: z.boolean(),
});

export const publicRideSchema = rideBaseResponseSchema;

export const rideSchema = rideBaseResponseSchema.extend({
  driver: z.strictObject({ id: z.uuid(), login: z.string() }),
  vehicle: z.strictObject({
    id: z.uuid(),
    brand: z.string(),
    model: z.string(),
    color: z.string(),
    year: z.number().int(),
  }),
  originLatitude: z.number().nullable(),
  originLongitude: z.number().nullable(),
  destinationLatitude: z.number().nullable(),
  destinationLongitude: z.number().nullable(),
  notes: z.string().nullable(),
  startedAt: isoDateTimeSchema('Data de início inválida').nullable(),
  completedAt: isoDateTimeSchema('Data de conclusão inválida').nullable(),
  canceledAt: isoDateTimeSchema('Data de cancelamento inválida').nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: isoDateTimeSchema('Data de criação inválida'),
  updatedAt: isoDateTimeSchema('Data de atualização inválida'),
});

export type CreateRideSchema = z.infer<typeof createRideSchema>;
export type UpdateRideSchema = z.infer<typeof updateRideSchema>;
export type CancelRideSchema = z.infer<typeof cancelRideSchema>;
export type RideQuerySchema = z.infer<typeof rideQuerySchema>;
export type MineRideQuerySchema = z.infer<typeof mineRideQuerySchema>;
export type PublicRideSchema = z.infer<typeof publicRideSchema>;
export type RideSchema = z.infer<typeof rideSchema>;

export class CreateRideDto extends createZodDto(createRideSchema) {}
export class UpdateRideDto extends createZodDto(updateRideSchema) {}
export class CancelRideDto extends createZodDto(cancelRideSchema) {}
export class RideQueryDto extends createZodDto(rideQuerySchema) {}
export class MineRideQueryDto extends createZodDto(mineRideQuerySchema) {}
export class PublicRideDto extends createZodDto(publicRideSchema) {}
export class RideDto extends createZodDto(rideSchema) {}
