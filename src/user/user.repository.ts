import { Inject } from '@nestjs/common';
import { PrismaClient, Prisma } from 'generated/prisma/client';
import { USER_SELECT } from 'src/utils/selects';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from 'src/utils/schemas/user.schema';

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

  async createUser(params: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(params.password, salt);
    return this.prisma.user.create({
      data: {
        ...params,
        password: hashPassword,
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
