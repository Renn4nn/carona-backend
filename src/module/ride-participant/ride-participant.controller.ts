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
  CancelRideParticipantDto,
  CreateRideParticipantDto,
  type MyRideParticipationSchema,
  type RideParticipantSchema,
  RideParticipationQueryDto,
} from 'src/utils/schemas/ride-participant.schema';
import type { ApiSuccessResponse, CursorPage } from 'src/utils/types/api/api';
import type { RequestUser } from 'src/utils/types/auth/auth';
import { RideParticipantService } from './ride-participant.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RideParticipantController {
  constructor(private readonly service: RideParticipantService) {}

  @Post('rides/:rideId/participants')
  async request(
    @CurrentUser() user: RequestUser,
    @Param('rideId', ParseUUIDPipe) rideId: string,
    @Body() body: CreateRideParticipantDto,
  ): Promise<ApiSuccessResponse<RideParticipantSchema>> {
    return { data: await this.service.request(user.userId, rideId, body) };
  }

  @Get('rides/:rideId/participants')
  async findByRide(
    @CurrentUser() user: RequestUser,
    @Param('rideId', ParseUUIDPipe) rideId: string,
  ): Promise<ApiSuccessResponse<RideParticipantSchema[]>> {
    return { data: await this.service.findByRide(user.userId, rideId) };
  }

  @Patch('rides/:rideId/participants/:participantId/accept')
  async accept(
    @CurrentUser() user: RequestUser,
    @Param('rideId', ParseUUIDPipe) rideId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
  ): Promise<ApiSuccessResponse<RideParticipantSchema>> {
    return {
      data: await this.service.accept(user.userId, rideId, participantId),
    };
  }

  @Patch('rides/:rideId/participants/:participantId/reject')
  async reject(
    @CurrentUser() user: RequestUser,
    @Param('rideId', ParseUUIDPipe) rideId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
  ): Promise<ApiSuccessResponse<RideParticipantSchema>> {
    return {
      data: await this.service.reject(user.userId, rideId, participantId),
    };
  }

  @Delete('rides/:rideId/participants/me')
  async cancelMine(
    @CurrentUser() user: RequestUser,
    @Param('rideId', ParseUUIDPipe) rideId: string,
    @Body() body: CancelRideParticipantDto,
  ): Promise<ApiSuccessResponse<RideParticipantSchema>> {
    return { data: await this.service.cancelMine(user.userId, rideId, body) };
  }

  @Get('ride-participations/me')
  async findMine(
    @CurrentUser() user: RequestUser,
    @Query() query: RideParticipationQueryDto,
  ): Promise<ApiSuccessResponse<CursorPage<MyRideParticipationSchema>>> {
    return { data: await this.service.findMine(user.userId, query) };
  }
}
