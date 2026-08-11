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
  CourseQueryDto,
  type CourseSchema,
  CreateCourseDto,
  UpdateCourseDto,
} from 'src/utils/schemas/course.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findMany(
    @Query() query: CourseQueryDto,
  ): Promise<ApiSuccessResponse<CourseSchema[]>> {
    return { data: await this.courseService.findPublicMany(query) };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return { data: await this.courseService.findPublicById(id) };
  }
}

@Controller('admin/courses')
@UseGuards(JwtAuthGuard)
export class AdminCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findMany(
    @CurrentUser() user: RequestUser,
    @Query() query: CourseQueryDto,
  ): Promise<ApiSuccessResponse<CourseSchema[]>> {
    return { data: await this.courseService.findAdminMany(user.userId, query) };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return {
      data: await this.courseService.findAdminById(user.userId, id),
    };
  }

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateCourseDto,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return { data: await this.courseService.create(user.userId, body) };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCourseDto,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return { data: await this.courseService.update(user.userId, id, body) };
  }

  @Delete(':id')
  async deactivate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return { data: await this.courseService.deactivate(user.userId, id) };
  }

  @Patch(':id/activate')
  async activate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<CourseSchema>> {
    return { data: await this.courseService.activate(user.userId, id) };
  }
}
