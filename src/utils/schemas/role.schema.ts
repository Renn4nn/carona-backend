import type { Prisma } from 'generated/prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const roleSchema = z.strictObject({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<Prisma.RoleModel>;

export type RoleSchema = z.infer<typeof roleSchema>;

export class RoleDto extends createZodDto(roleSchema) {}
