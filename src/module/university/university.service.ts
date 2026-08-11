import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/module/user/user.service';
import type {
  CreateUniversitySchema,
  UniversityQuerySchema,
  UniversitySchema,
  UpdateUniversitySchema,
} from 'src/utils/schemas/university.schema';
import { UniversityRepository } from './university.repository';

@Injectable()
export class UniversityService {
  constructor(
    private readonly universityRepository: UniversityRepository,
    private readonly userService: UserService,
  ) {}

  findPublicMany(query: UniversityQuerySchema): Promise<UniversitySchema[]> {
    return this.universityRepository.findMany(query, true);
  }

  async findPublicById(id: string): Promise<UniversitySchema> {
    const university = await this.universityRepository.findById(id, true);
    if (!university) {
      throw new NotFoundException('Universidade não encontrada.');
    }
    return university;
  }

  async findAdminMany(
    userId: string,
    query: UniversityQuerySchema,
  ): Promise<UniversitySchema[]> {
    await this.userService.assertAdmin(userId);
    return this.universityRepository.findMany(query);
  }

  async findAdminById(userId: string, id: string): Promise<UniversitySchema> {
    await this.userService.assertAdmin(userId);
    return this.getExisting(id);
  }

  async create(
    userId: string,
    data: CreateUniversitySchema,
  ): Promise<UniversitySchema> {
    await this.userService.assertAdmin(userId);
    const duplicate = await this.universityRepository.findByIdentity(
      data.name,
      data.city,
      data.state,
    );
    if (duplicate) {
      throw new ConflictException('Esta universidade já está cadastrada.');
    }
    return this.universityRepository.create(data);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateUniversitySchema,
  ): Promise<UniversitySchema> {
    await this.userService.assertAdmin(userId);
    const current = await this.getExisting(id);
    const identity = {
      name: data.name ?? current.name,
      city: data.city ?? current.city,
      state: data.state ?? current.state,
    };
    const duplicate = await this.universityRepository.findByIdentity(
      identity.name,
      identity.city,
      identity.state,
    );
    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Esta universidade já está cadastrada.');
    }
    return this.universityRepository.update(id, data);
  }

  async deactivate(userId: string, id: string): Promise<UniversitySchema> {
    await this.userService.assertAdmin(userId);
    await this.getExisting(id);
    return this.universityRepository.setActive(id, false);
  }

  async activate(userId: string, id: string): Promise<UniversitySchema> {
    await this.userService.assertAdmin(userId);
    await this.getExisting(id);
    return this.universityRepository.setActive(id, true);
  }

  async getActiveForRelation(id: string): Promise<UniversitySchema> {
    return this.findPublicById(id);
  }

  private async getExisting(id: string): Promise<UniversitySchema> {
    const university = await this.universityRepository.findById(id);
    if (!university) {
      throw new NotFoundException('Universidade não encontrada.');
    }
    return university;
  }
}
