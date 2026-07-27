import {
  Controller,
  Get,
  ParseUUIDPipe,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/JwtGuard';
import { UserService } from './user.service';
import { ApiSuccessResponse } from 'src/utils/types/api/api';
import {
  CreateUserDto,
  UpdateUserDto,
  UserSchema,
} from 'src/utils/schemas/user.schema';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly service: UserService,
    // private readonly authService: AuthService,
  ) {}

  @Get()
  async getUsers(): Promise<ApiSuccessResponse<UserSchema[]>> {
    const result = await this.service.getUsers();
    return {
      data: result,
    };
  }

  @Get(':id')
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UserSchema>> {
    const result = await this.service.getUser(id);
    return {
      data: result,
    };
  }

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
  ): Promise<ApiSuccessResponse<UserSchema>> {
    const result = await this.service.createUser(body);
    return {
      data: result,
    };
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<ApiSuccessResponse<UserSchema>> {
    const result = await this.service.updateUser(id, body);
    return {
      data: result,
    };
  }

  @Delete(':id')
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<UserSchema>> {
    const result = await this.service.deleteUser(id);
    return {
      data: result,
    };
  }
}
