import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import type {
  CreateStudentProfileSchema,
  UpdateStudentProfileSchema,
} from 'src/utils/schemas/student-profile.schema';
import { STUDENT_PROFILE_SELECT } from 'src/utils/selects';

@Injectable()
export class StudentProfileRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  findByUserId(userId: string) {
    return this.prisma.studentProfile.findUnique({
      where: { userId },
      select: STUDENT_PROFILE_SELECT,
    });
  }

  create(userId: string, data: CreateStudentProfileSchema) {
    return this.prisma.studentProfile.create({
      data: { ...data, userId },
      select: STUDENT_PROFILE_SELECT,
    });
  }

  update(userId: string, data: UpdateStudentProfileSchema) {
    return this.prisma.studentProfile.update({
      where: { userId },
      data,
      select: STUDENT_PROFILE_SELECT,
    });
  }

  setActive(userId: string, active: boolean) {
    return this.prisma.studentProfile.update({
      where: { userId },
      data: { active },
      select: STUDENT_PROFILE_SELECT,
    });
  }
}
