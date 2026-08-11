import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const participantStatusSchema = z.strictObject({
  id: z.uuid(),
  code: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'COMPLETED']),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  displayOrder: z.number().int(),
});

export type ParticipantStatusSchema = z.infer<typeof participantStatusSchema>;
export class ParticipantStatusDto extends createZodDto(
  participantStatusSchema,
) {}
