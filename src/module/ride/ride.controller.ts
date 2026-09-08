import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  CancelRideDto,
  CreateRideDto,
  MineRideQueryDto,
  NearbyRideQueryDto,
  type NearbyRideSchema,
  type PublicRideSchema,
  RideQueryDto,
  type RideSchema,
  UpdateRideDto,
} from 'src/utils/schemas/ride.schema';
import type { ApiSuccessResponse, CursorPage } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { RideService } from './ride.service';

@Controller('public/rides')
export class PublicRideController {
  constructor(private readonly service: RideService) {}

  @Get()
  async findMany(
    @Query() query: RideQueryDto,
  ): Promise<ApiSuccessResponse<CursorPage<PublicRideSchema>>> {
    return { data: await this.service.findPublicMany(query) };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PublicRideSchema>> {
    return { data: await this.service.findPublicById(id) };
  }
}

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RideController {
  constructor(private readonly service: RideService) {}

  @Get()
  async findMany(
    @CurrentUser() user: RequestUser,
    @Query() query: RideQueryDto,
  ): Promise<ApiSuccessResponse<CursorPage<RideSchema>>> {
    return { data: await this.service.findMany(user.userId, query) };
  }

  @Get('nearby')
  async findNearby(
    @CurrentUser() user: RequestUser,
    @Query() query: NearbyRideQueryDto,
  ): Promise<ApiSuccessResponse<NearbyRideSchema[]>> {
    return { data: await this.service.findNearby(user.userId, query) };
  }

  @Get('mine')
  async findMine(
    @CurrentUser() user: RequestUser,
    @Query() query: MineRideQueryDto,
  ): Promise<ApiSuccessResponse<CursorPage<RideSchema>>> {
    return { data: await this.service.findMine(user.userId, query) };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.findById(user.userId, id) };
  }

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateRideDto,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.create(user.userId, body) };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRideDto,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.update(user.userId, id, body) };
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.start(user.userId, id) };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.complete(user.userId, id) };
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelRideDto,
  ): Promise<ApiSuccessResponse<RideSchema>> {
    return { data: await this.service.cancel(user.userId, id, body) };
  }
}
