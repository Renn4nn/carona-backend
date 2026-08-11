import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UniversityService } from 'src/module/university/university.service';
import { UserService } from 'src/module/user/user.service';
import type {
  CourseQuerySchema,
  CourseSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
} from 'src/utils/schemas/course.schema';
import { CourseRepository } from './course.repository';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly universityService: UniversityService,
    private readonly userService: UserService,
  ) {}

  findPublicMany(query: CourseQuerySchema): Promise<CourseSchema[]> {
    return this.courseRepository.findMany(query, true);
  }

  async findPublicById(id: string): Promise<CourseSchema> {
    const course = await this.courseRepository.findById(id, true);
    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }
    return course;
  }

  async findAdminMany(
    userId: string,
    query: CourseQuerySchema,
  ): Promise<CourseSchema[]> {
    await this.userService.assertAdmin(userId);
    return this.courseRepository.findMany(query);
  }

  async findAdminById(userId: string, id: string): Promise<CourseSchema> {
    await this.userService.assertAdmin(userId);
    return this.getExisting(id);
  }

  async create(
    userId: string,
    data: CreateCourseSchema,
  ): Promise<CourseSchema> {
    await this.userService.assertAdmin(userId);
    await this.universityService.getActiveForRelation(data.universityId);
    const duplicate = await this.courseRepository.findByIdentity(
      data.universityId,
      data.name,
    );
    if (duplicate) {
      throw new ConflictException(
        'Este curso já está cadastrado nesta universidade.',
      );
    }
    return this.courseRepository.create(data);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateCourseSchema,
  ): Promise<CourseSchema> {
    await this.userService.assertAdmin(userId);
    const current = await this.getExisting(id);
    const universityId = data.universityId ?? current.universityId;
    const name = data.name ?? current.name;
    await this.universityService.getActiveForRelation(universityId);
    const duplicate = await this.courseRepository.findByIdentity(
      universityId,
      name,
    );
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        'Este curso já está cadastrado nesta universidade.',
      );
    }
    return this.courseRepository.update(id, data);
  }

  async deactivate(userId: string, id: string): Promise<CourseSchema> {
    await this.userService.assertAdmin(userId);
    await this.getExisting(id);
    return this.courseRepository.setActive(id, false);
  }

  async activate(userId: string, id: string): Promise<CourseSchema> {
    await this.userService.assertAdmin(userId);
    const course = await this.getExisting(id);
    await this.universityService.getActiveForRelation(course.universityId);
    return this.courseRepository.setActive(id, true);
  }

  async getActiveForRelation(id: string): Promise<CourseSchema> {
    return this.findPublicById(id);
  }

  private async getExisting(id: string): Promise<CourseSchema> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }
    return course;
  }
}
