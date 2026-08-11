import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { paymentMethodSchema } from './payment-method.schema';
import { rideStatusSchema } from './ride-status.schema';

const nameSchema = (field: string) =>
  z
    .string({ error: `Campo ${field} é obrigatório` })
    .trim()
    .min(2, `Campo ${field} deve ter pelo menos 2 caracteres`)
    .max(120, `Campo ${field} deve ter no máximo 120 caracteres`);

const addressSchema = (field: string) =>
  z
    .string({ error: `Campo ${field} é obrigatório` })
    .trim()
    .min(5, `Campo ${field} deve ter pelo menos 5 caracteres`)
    .max(255, `Campo ${field} deve ter no máximo 255 caracteres`);

const optionalText = (max: number) => z.string().trim().max(max).optional();
const latitudeSchema = z.number().min(-90).max(90).optional();
const longitudeSchema = z.number().min(-180).max(180).optional();
const isoDateTimeSchema = (message: string) =>
  z.iso.datetime({ offset: true, error: message });

const rideInputBaseSchema = z.strictObject({
  vehicleId: z.uuid({ error: 'Veículo inválido' }),
  paymentMethodId: z.uuid({ error: 'Método de pagamento inválido' }).optional(),
  originName: nameSchema('Nome da origem'),
  originAddress: addressSchema('Endereço da origem'),
  originLatitude: latitudeSchema,
  originLongitude: longitudeSchema,
  destinationName: nameSchema('Nome do destino'),
  destinationAddress: addressSchema('Endereço do destino'),
  destinationLatitude: latitudeSchema,
  destinationLongitude: longitudeSchema,
  departureAt: isoDateTimeSchema('Data de partida inválida'),
  estimatedArrivalAt: isoDateTimeSchema(
    'Data estimada de chegada inválida',
  ).optional(),
  totalSeats: z
    .number({ error: 'Campo Vagas é obrigatório' })
    .int('Campo Vagas deve ser um número inteiro')
    .min(1, 'A carona deve oferecer pelo menos uma vaga'),
  contributionPerSeat: z
    .number()
    .min(0, 'A contribuição não pode ser negativa')
    .max(99999999.99, 'A contribuição excede o limite permitido')
    .default(0),
  paymentNotes: optionalText(300),
  description: optionalText(1000),
  rules: optionalText(1000),
});

function hasCoordinatePair(
  latitude: number | undefined,
  longitude: number | undefined,
) {
  return (latitude === undefined) === (longitude === undefined);
}

export const createRideSchema = rideInputBaseSchema.superRefine((data, ctx) => {
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
  if (
    data.estimatedArrivalAt &&
    new Date(data.estimatedArrivalAt) <= new Date(data.departureAt)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'A chegada estimada deve ser posterior à partida',
      path: ['estimatedArrivalAt'],
    });
  }
  if (data.contributionPerSeat > 0 && !data.paymentMethodId) {
    ctx.addIssue({
      code: 'custom',
      message: 'Informe o método para contribuições maiores que zero',
      path: ['paymentMethodId'],
    });
  }
});

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
  origin: z.string().trim().min(1).max(120).optional(),
  destination: z.string().trim().min(1).max(120).optional(),
  departureFrom: isoDateTimeSchema('Data inicial inválida').optional(),
  departureTo: isoDateTimeSchema('Data final inválida').optional(),
  maxContribution: z.coerce.number().min(0).optional(),
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
  originName: z.string(),
  destinationName: z.string(),
  departureAt: isoDateTimeSchema('Data de partida inválida'),
  estimatedArrivalAt: isoDateTimeSchema(
    'Data estimada de chegada inválida',
  ).nullable(),
  totalSeats: z.number().int(),
  availableSeats: z.number().int(),
  isFull: z.boolean(),
  contributionPerSeat: z.string(),
  paymentMethod: paymentMethodSchema.nullable(),
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
  originAddress: z.string(),
  originLatitude: z.number().nullable(),
  originLongitude: z.number().nullable(),
  destinationAddress: z.string(),
  destinationLatitude: z.number().nullable(),
  destinationLongitude: z.number().nullable(),
  paymentNotes: z.string().nullable(),
  description: z.string().nullable(),
  rules: z.string().nullable(),
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
