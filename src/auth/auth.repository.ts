import { Injectable, Inject } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';
import type {
  CreateUserSchema,
  RegisterUserSchema,
} from 'src/utils/schemas/user.schema';
import { authenticationUserSelect, USER_SELECT } from 'src/utils/selects';

export type StudentAccountCreationResult =
  | {
      status: 'created';
      user: Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;
    }
  | { status: 'login_taken' }
  | { status: 'role_unavailable' }
  | { status: 'course_unavailable' };

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  async findByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: { login: { equals: login, mode: 'insensitive' } },
      select: authenticationUserSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async createUser(params: CreateUserSchema) {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(params.password, salt);

    return this.prisma.user.create({
      data: {
        ...params,
        password: hashPassword,
        role: {
          connect: {
            code: 'USER',
          },
        },
      },
      select: USER_SELECT,
    });
  }

  async createStudentAccount(
    params: RegisterUserSchema,
  ): Promise<StudentAccountCreationResult> {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(params.password, salt);

    return this.prisma.$transaction(async (transaction) => {
      const [existingUser, role, course] = await Promise.all([
        transaction.user.findFirst({
          where: {
            login: { equals: params.login, mode: 'insensitive' },
          },
          select: { id: true },
        }),
        transaction.role.findFirst({
          where: { code: 'USER', active: true },
          select: { id: true },
        }),
        transaction.course.findFirst({
          where: {
            id: params.studentProfile.courseId,
            active: true,
            university: { active: true },
          },
          select: { id: true },
        }),
      ]);

      if (existingUser) return { status: 'login_taken' as const };
      if (!role) return { status: 'role_unavailable' as const };
      if (!course) return { status: 'course_unavailable' as const };

      const user = await transaction.user.create({
        data: {
          login: params.login,
          password: hashPassword,
          roleId: role.id,
          active: true,
          studentProfile: {
            create: {
              name: params.studentProfile.name,
              registration: params.studentProfile.registration,
              courseId: course.id,
              active: true,
            },
          },
        },
        select: USER_SELECT,
      });

      return { status: 'created' as const, user };
    });
  }
}
