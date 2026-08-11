import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const universityNameSchema = z
  .string({ error: 'Campo Nome é obrigatório' })
  .trim()
  .min(2, 'Campo Nome deve ter pelo menos 2 caracteres')
  .max(120, 'Campo Nome deve ter no máximo 120 caracteres');

const citySchema = z
  .string({ error: 'Campo Cidade é obrigatório' })
  .trim()
  .min(2, 'Campo Cidade deve ter pelo menos 2 caracteres')
  .max(100, 'Campo Cidade deve ter no máximo 100 caracteres');

const stateSchema = z
  .string({ error: 'Campo Estado é obrigatório' })
  .trim()
  .transform((state) => state.toUpperCase())
  .refine((state) => /^[A-Z]{2}$/.test(state), {
    message: 'Campo Estado deve conter a sigla com 2 letras',
  });

export const createUniversitySchema = z.strictObject({
  name: universityNameSchema,
  city: citySchema,
  state: stateSchema,
});

export const updateUniversitySchema = createUniversitySchema.partial();

export const universityQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(120).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  state: z
    .string()
    .trim()
    .transform((state) => state.toUpperCase())
    .refine((state) => /^[A-Z]{2}$/.test(state), {
      message: 'Estado deve conter a sigla com 2 letras',
    })
    .optional(),
  active: z.enum(['true', 'false']).optional(),
});

export const universitySchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UniversitySchema = z.infer<typeof universitySchema>;
export type CreateUniversitySchema = z.infer<typeof createUniversitySchema>;
export type UpdateUniversitySchema = z.infer<typeof updateUniversitySchema>;
export type UniversityQuerySchema = z.infer<typeof universityQuerySchema>;

export class UniversityDto extends createZodDto(universitySchema) {}
export class CreateUniversityDto extends createZodDto(createUniversitySchema) {}
export class UpdateUniversityDto extends createZodDto(updateUniversitySchema) {}
export class UniversityQueryDto extends createZodDto(universityQuerySchema) {}
