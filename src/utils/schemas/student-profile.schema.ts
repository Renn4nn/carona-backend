import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { courseSchema } from './course.schema';

export const createStudentProfileSchema = z.strictObject({
  name: z
    .string({ error: 'Campo Nome é obrigatório' })
    .trim()
    .min(2, 'Campo Nome deve ter pelo menos 2 caracteres')
    .max(120, 'Campo Nome deve ter no máximo 120 caracteres'),
  courseId: z.uuid({ error: 'Curso inválido' }),
  registration: z
    .string({ error: 'Campo Matrícula é obrigatório' })
    .trim()
    .min(1, 'Campo Matrícula é obrigatório')
    .max(50, 'Campo Matrícula deve ter no máximo 50 caracteres'),
});

export const updateStudentProfileSchema = createStudentProfileSchema.partial();

export const studentProfileSchema = z.strictObject({
  id: z.uuid(),
  userId: z.uuid(),
  courseId: z.uuid(),
  name: z.string(),
  registration: z.string(),
  active: z.boolean(),
  course: courseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type StudentProfileSchema = z.infer<typeof studentProfileSchema>;
export type CreateStudentProfileSchema = z.infer<
  typeof createStudentProfileSchema
>;
export type UpdateStudentProfileSchema = z.infer<
  typeof updateStudentProfileSchema
>;

export class StudentProfileDto extends createZodDto(studentProfileSchema) {}
export class CreateStudentProfileDto extends createZodDto(
  createStudentProfileSchema,
) {}
export class UpdateStudentProfileDto extends createZodDto(
  updateStudentProfileSchema,
) {}
