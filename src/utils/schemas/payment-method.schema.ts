import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const paymentMethodSchema = z.strictObject({
  id: z.uuid(),
  code: z.enum(['CASH', 'PIX', 'BANK_TRANSFER', 'OTHER']),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  displayOrder: z.number().int(),
});

export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;
export class PaymentMethodDto extends createZodDto(paymentMethodSchema) {}
