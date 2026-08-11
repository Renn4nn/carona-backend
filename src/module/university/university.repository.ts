import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import type {
  CreateUniversitySchema,
  UniversityQuerySchema,
  UpdateUniversitySchema,
} from 'src/utils/schemas/university.schema';
import { UNIVERSITY_SELECT } from 'src/utils/selects';

@Injectable()
export class UniversityRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  findMany(query: UniversityQuerySchema, publicOnly = false) {
    const where: Prisma.UniversityWhereInput = {
      active: publicOnly
        ? true
        : query.active === undefined
          ? undefined
          : query.active === 'true',
      name: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
      city: query.city
        ? { equals: query.city, mode: 'insensitive' }
        : undefined,
      state: query.state,
    };

    return this.prisma.university.findMany({
      where,
      orderBy: [{ name: 'asc' }, { city: 'asc' }],
      select: UNIVERSITY_SELECT,
    });
  }

  findById(id: string, publicOnly = false) {
    return this.prisma.university.findFirst({
      where: { id, active: publicOnly ? true : undefined },
      select: UNIVERSITY_SELECT,
    });
  }

  findByIdentity(name: string, city: string, state: string) {
    return this.prisma.university.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        city: { equals: city, mode: 'insensitive' },
        state,
      },
      select: { id: true },
    });
  }

  create(data: CreateUniversitySchema) {
    return this.prisma.university.create({
      data,
      select: UNIVERSITY_SELECT,
    });
  }

  update(id: string, data: UpdateUniversitySchema) {
    return this.prisma.university.update({
      where: { id },
      data,
      select: UNIVERSITY_SELECT,
    });
  }

  setActive(id: string, active: boolean) {
    return this.prisma.university.update({
      where: { id },
      data: { active },
      select: UNIVERSITY_SELECT,
    });
  }
}
