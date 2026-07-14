import z from 'zod';
import type { Prisma } from 'generated/prisma/client';
import { createZodDto } from 'nestjs-zod';

export const createUserSchema = z.strictObject({
  login: z
    .string({
      error: 'Campo Login é obrigatório',
    })
    .min(3, 'Campo Login deve ter pelo menos 3 caracteres'),

  password: z
    .string({
      error: 'Campo Senha é obrigatório',
    })
    .min(6, 'Campo Senha deve ter pelo menos 6 caracteres'),
}) satisfies z.ZodType<Prisma.UserCreateInput>;

export const registerUserSchema = z
  .object({
    login: z
      .string({
        error: 'Campo Login é obrigatório',
      })
      .min(3, 'Campo Login deve ter pelo menos 3 caracteres'),
    password: z
      .string({
        error: 'Campo Senha é obrigatório',
      })
      .min(6, 'Campo Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string({
        error: 'Confirmação de senha é obrigatória',
      })
      .min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Atribui o erro diretamente ao campo confirmPassword
  });

export const userSchema = z.strictObject({
  id: z.uuid(),
  login: z.string(),
  password: z.string(),
  admin: z.boolean(),
  active: z.boolean(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
}) satisfies z.ZodType<Prisma.UserModel>;

export const updateUserSchema = createUserSchema.partial();

export type UserSchema = z.infer<typeof userSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

// DTO
export class UserDto extends createZodDto(userSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class RegisterUserDto extends createZodDto(registerUserSchema) {}
