import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import type { RoleSchema } from 'src/utils/schemas/role.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findMany(): Promise<ApiSuccessResponse<RoleSchema[]>> {
    const roles = await this.roleService.findMany();
    return { data: roles };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<RoleSchema>> {
    const role = await this.roleService.findById(id);
    return { data: role };
  }
}
