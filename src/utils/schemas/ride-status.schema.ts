import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const rideStatusSchema = z.strictObject({
  id: z.uuid(),
  code: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  displayOrder: z.number().int(),
});

export type RideStatusSchema = z.infer<typeof rideStatusSchema>;
export class RideStatusDto extends createZodDto(rideStatusSchema) {}
