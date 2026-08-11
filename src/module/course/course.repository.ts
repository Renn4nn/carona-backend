import { Inject, Injectable } from '@nestjs/common';
import type { Prisma, PrismaClient } from 'generated/prisma/client';
import type {
  CourseQuerySchema,
  CreateCourseSchema,
  UpdateCourseSchema,
} from 'src/utils/schemas/course.schema';
import { COURSE_SELECT } from 'src/utils/selects';

@Injectable()
export class CourseRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  findMany(query: CourseQuerySchema, publicOnly = false) {
    const where: Prisma.CourseWhereInput = {
      active: publicOnly
        ? true
        : query.active === undefined
          ? undefined
          : query.active === 'true',
      name: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
      universityId: query.universityId,
      university: publicOnly ? { active: true } : undefined,
    };

    return this.prisma.course.findMany({
      where,
      orderBy: [{ name: 'asc' }, { university: { name: 'asc' } }],
      select: COURSE_SELECT,
    });
  }

  findById(id: string, publicOnly = false) {
    return this.prisma.course.findFirst({
      where: {
        id,
        active: publicOnly ? true : undefined,
        university: publicOnly ? { active: true } : undefined,
      },
      select: COURSE_SELECT,
    });
  }

  findByIdentity(universityId: string, name: string) {
    return this.prisma.course.findFirst({
      where: {
        universityId,
        name: { equals: name, mode: 'insensitive' },
      },
      select: { id: true },
    });
  }

  create(data: CreateCourseSchema) {
    return this.prisma.course.create({
      data,
      select: COURSE_SELECT,
    });
  }

  update(id: string, data: UpdateCourseSchema) {
    return this.prisma.course.update({
      where: { id },
      data,
      select: COURSE_SELECT,
    });
  }

  setActive(id: string, active: boolean) {
    return this.prisma.course.update({
      where: { id },
      data: { active },
      select: COURSE_SELECT,
    });
  }
}
