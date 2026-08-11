import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/JwtGuard';
import {
  CreateUniversityDto,
  UniversityQueryDto,
  type UniversitySchema,
  UpdateUniversityDto,
} from 'src/utils/schemas/university.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { UniversityService } from './university.service';

@Controller('universities')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Get()
  async findMany(
    @Query() query: UniversityQueryDto,
  ): Promise<ApiSuccessResponse<UniversitySchema[]>> {
    return { data: await this.universityService.findPublicMany(query) };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return { data: await this.universityService.findPublicById(id) };
  }
}

@Controller('admin/universities')
@UseGuards(JwtAuthGuard)
export class AdminUniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Get()
  async findMany(
    @CurrentUser() user: RequestUser,
    @Query() query: UniversityQueryDto,
  ): Promise<ApiSuccessResponse<UniversitySchema[]>> {
    return {
      data: await this.universityService.findAdminMany(user.userId, query),
    };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return {
      data: await this.universityService.findAdminById(user.userId, id),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateUniversityDto,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return {
      data: await this.universityService.create(user.userId, body),
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUniversityDto,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return {
      data: await this.universityService.update(user.userId, id, body),
    };
  }

  @Delete(':id')
  async deactivate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return {
      data: await this.universityService.deactivate(user.userId, id),
    };
  }

  @Patch(':id/activate')
  async activate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UniversitySchema>> {
    return {
      data: await this.universityService.activate(user.userId, id),
    };
  }
}
