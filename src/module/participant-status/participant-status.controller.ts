import { Controller, Get } from '@nestjs/common';
import type { ParticipantStatusSchema } from 'src/utils/schemas/participant-status.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import { ParticipantStatusService } from './participant-status.service';

@Controller('participant-statuses')
export class ParticipantStatusController {
  constructor(private readonly service: ParticipantStatusService) {}

  @Get()
  async findActive(): Promise<ApiSuccessResponse<ParticipantStatusSchema[]>> {
    return { data: await this.service.findActive() };
  }
}
