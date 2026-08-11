import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import { USER_SELECT } from 'src/utils/selects';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from 'src/utils/schemas/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  user(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUniqueOrThrow({
      where,
      select: USER_SELECT,
    });
  }

  users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: USER_SELECT,
    });
  }

  findAccessById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        active: true,
        role: {
          select: {
            code: true,
            active: true,
          },
        },
      },
    });
  }

  async createUser(params: CreateUserDto) {
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

  deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: USER_SELECT,
    });
  }

  async updateUser(id: string, data: UpdateUserDto) {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data: data,
      select: USER_SELECT,
    });
  }
}
