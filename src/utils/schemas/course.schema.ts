import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { universitySchema } from './university.schema';

const courseNameSchema = z
  .string({ error: 'Campo Nome é obrigatório' })
  .trim()
  .min(2, 'Campo Nome deve ter pelo menos 2 caracteres')
  .max(120, 'Campo Nome deve ter no máximo 120 caracteres');

export const createCourseSchema = z.strictObject({
  universityId: z.uuid({ error: 'Universidade inválida' }),
  name: courseNameSchema,
});

export const updateCourseSchema = createCourseSchema.partial();

export const courseQuerySchema = z.strictObject({
  search: z.string().trim().min(1).max(120).optional(),
  universityId: z.uuid({ error: 'Universidade inválida' }).optional(),
  active: z.enum(['true', 'false']).optional(),
});

export const courseSchema = z.strictObject({
  id: z.uuid(),
  universityId: z.uuid(),
  name: z.string(),
  active: z.boolean(),
  university: universitySchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseSchema = z.infer<typeof courseSchema>;
export type CreateCourseSchema = z.infer<typeof createCourseSchema>;
export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
export type CourseQuerySchema = z.infer<typeof courseQuerySchema>;

export class CourseDto extends createZodDto(courseSchema) {}
export class CreateCourseDto extends createZodDto(createCourseSchema) {}
export class UpdateCourseDto extends createZodDto(updateCourseSchema) {}
export class CourseQueryDto extends createZodDto(courseQuerySchema) {}
