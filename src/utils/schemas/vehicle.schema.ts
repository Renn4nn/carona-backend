import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const vehicleTextSchema = (field: string) =>
  z
    .string({ error: `Campo ${field} é obrigatório` })
    .trim()
    .min(2, `Campo ${field} deve ter pelo menos 2 caracteres`)
    .max(60, `Campo ${field} deve ter no máximo 60 caracteres`);

const plateSchema = z
  .string({ error: 'Campo Placa é obrigatório' })
  .trim()
  .transform((plate) => plate.toUpperCase().replace(/[\s-]/g, ''))
  .refine((plate) => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate), {
    message: 'Placa inválida',
  });

export const createVehicleSchema = z.strictObject({
  brand: vehicleTextSchema('Marca'),
  model: vehicleTextSchema('Modelo'),
  color: vehicleTextSchema('Cor'),
  plate: plateSchema,
  year: z
    .number({ error: 'Campo Ano é obrigatório' })
    .int('Campo Ano deve ser um número inteiro')
    .min(1900, 'Campo Ano deve ser maior ou igual a 1900')
    .max(
      new Date().getFullYear() + 1,
      'Campo Ano não pode ser posterior ao próximo ano',
    ),
  passengerCapacity: z
    .number({ error: 'Campo Capacidade de passageiros é obrigatório' })
    .int('Capacidade de passageiros deve ser um número inteiro')
    .min(1, 'Capacidade de passageiros deve ser pelo menos 1')
    .max(20, 'Capacidade de passageiros deve ser no máximo 20'),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.strictObject({
  active: z.enum(['true', 'false']).optional(),
});

export const vehicleSchema = z.strictObject({
  id: z.uuid(),
  ownerId: z.uuid(),
  brand: z.string(),
  model: z.string(),
  color: z.string(),
  plate: z.string(),
  year: z.number().int(),
  passengerCapacity: z.number().int(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VehicleSchema = z.infer<typeof vehicleSchema>;
export type CreateVehicleSchema = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>;
export type VehicleQuerySchema = z.infer<typeof vehicleQuerySchema>;

export class VehicleDto extends createZodDto(vehicleSchema) {}
export class CreateVehicleDto extends createZodDto(createVehicleSchema) {}
export class UpdateVehicleDto extends createZodDto(updateVehicleSchema) {}
export class VehicleQueryDto extends createZodDto(vehicleQuerySchema) {}
