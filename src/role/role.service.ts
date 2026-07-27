import { Injectable } from '@nestjs/common';
import type { RoleSchema } from 'src/utils/schemas/role.schema';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  findMany(): Promise<RoleSchema[]> {
    return this.roleRepository.findMany();
  }

  findById(id: string): Promise<RoleSchema> {
    return this.roleRepository.findById({ id });
  }
}
