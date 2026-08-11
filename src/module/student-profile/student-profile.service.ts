import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from 'src/module/course/course.service';
import { UserService } from 'src/module/user/user.service';
import type {
  CreateStudentProfileSchema,
  StudentProfileSchema,
  UpdateStudentProfileSchema,
} from 'src/utils/schemas/student-profile.schema';
import { StudentProfileRepository } from './student-profile.repository';

@Injectable()
export class StudentProfileService {
  constructor(
    private readonly studentProfileRepository: StudentProfileRepository,
    private readonly courseService: CourseService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    data: CreateStudentProfileSchema,
  ): Promise<StudentProfileSchema> {
    await this.userService.assertActive(userId);
    const existing = await this.studentProfileRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Este usuário já possui perfil acadêmico.');
    }
    await this.courseService.getActiveForRelation(data.courseId);
    return this.studentProfileRepository.create(userId, data);
  }

  async findMine(userId: string): Promise<StudentProfileSchema> {
    await this.userService.assertActive(userId);
    return this.getExisting(userId);
  }

  async update(
    userId: string,
    data: UpdateStudentProfileSchema,
  ): Promise<StudentProfileSchema> {
    await this.userService.assertActive(userId);
    await this.getExisting(userId);
    if (data.courseId) {
      await this.courseService.getActiveForRelation(data.courseId);
    }
    return this.studentProfileRepository.update(userId, data);
  }

  async deactivate(userId: string): Promise<StudentProfileSchema> {
    await this.userService.assertActive(userId);
    await this.getExisting(userId);
    return this.studentProfileRepository.setActive(userId, false);
  }

  async activate(userId: string): Promise<StudentProfileSchema> {
    await this.userService.assertActive(userId);
    const profile = await this.getExisting(userId);
    await this.courseService.getActiveForRelation(profile.courseId);
    return this.studentProfileRepository.setActive(userId, true);
  }

  private async getExisting(userId: string): Promise<StudentProfileSchema> {
    const profile = await this.studentProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil acadêmico não encontrado.');
    }
    return profile;
  }
}
