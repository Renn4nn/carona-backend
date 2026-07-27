import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import { ROLE_SELECT } from 'src/utils/selects';

@Injectable()
export class RoleRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  findMany() {
    return this.prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
      select: ROLE_SELECT,
    });
  }

  findById(where: Prisma.RoleWhereUniqueInput) {
    return this.prisma.role.findUniqueOrThrow({
      where,
      select: ROLE_SELECT,
    });
  }
}
