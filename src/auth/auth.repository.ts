import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/utils/schemas/user.schema';
import { authenticationUserSelect, USER_SELECT } from 'src/utils/selects';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  async findByLogin(login: string) {
    return this.prisma.user.findUnique({
      where: { login },
      select: authenticationUserSelect,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
        role: {
          connect: {
            code: 'USER',
          },
        },
      },
      select: USER_SELECT,
    });
  }
}
