import { Controller, Get } from '@nestjs/common';
import type { RideStatusSchema } from 'src/utils/schemas/ride-status.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import { RideStatusService } from './ride-status.service';

@Controller('ride-statuses')
export class RideStatusController {
  constructor(private readonly service: RideStatusService) {}

  @Get()
  async findActive(): Promise<ApiSuccessResponse<RideStatusSchema[]>> {
    return { data: await this.service.findActive() };
  }
}
