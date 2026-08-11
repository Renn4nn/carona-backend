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
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
  type VehicleSchema,
} from 'src/utils/schemas/vehicle.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  async findMine(
    @CurrentUser() user: RequestUser,
    @Query() query: VehicleQueryDto,
  ): Promise<ApiSuccessResponse<VehicleSchema[]>> {
    return { data: await this.vehicleService.findMine(user.userId, query) };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<VehicleSchema>> {
    return { data: await this.vehicleService.findById(user.userId, id) };
  }

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateVehicleDto,
  ): Promise<ApiSuccessResponse<VehicleSchema>> {
    return { data: await this.vehicleService.create(user.userId, body) };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateVehicleDto,
  ): Promise<ApiSuccessResponse<VehicleSchema>> {
    return { data: await this.vehicleService.update(user.userId, id, body) };
  }

  @Delete(':id')
  async deactivate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<VehicleSchema>> {
    return { data: await this.vehicleService.deactivate(user.userId, id) };
  }

  @Patch(':id/activate')
  async activate(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<VehicleSchema>> {
    return { data: await this.vehicleService.activate(user.userId, id) };
  }
}
