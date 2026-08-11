import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/JwtGuard';
import {
  CreateStudentProfileDto,
  type StudentProfileSchema,
  UpdateStudentProfileDto,
} from 'src/utils/schemas/student-profile.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { StudentProfileService } from './student-profile.service';

@Controller('student-profiles')
@UseGuards(JwtAuthGuard)
export class StudentProfileController {
  constructor(private readonly studentProfileService: StudentProfileService) {}

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateStudentProfileDto,
  ): Promise<ApiSuccessResponse<StudentProfileSchema>> {
    return {
      data: await this.studentProfileService.create(user.userId, body),
    };
  }

  @Get('me')
  async findMine(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiSuccessResponse<StudentProfileSchema>> {
    return { data: await this.studentProfileService.findMine(user.userId) };
  }

  @Patch('me')
  async update(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateStudentProfileDto,
  ): Promise<ApiSuccessResponse<StudentProfileSchema>> {
    return {
      data: await this.studentProfileService.update(user.userId, body),
    };
  }

  @Delete('me')
  async deactivate(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiSuccessResponse<StudentProfileSchema>> {
    return {
      data: await this.studentProfileService.deactivate(user.userId),
    };
  }

  @Patch('me/activate')
  async activate(
    @CurrentUser() user: RequestUser,
  ): Promise<ApiSuccessResponse<StudentProfileSchema>> {
    return {
      data: await this.studentProfileService.activate(user.userId),
    };
  }
}
