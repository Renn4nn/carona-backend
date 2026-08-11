import { Module } from '@nestjs/common';
import { ParticipantStatusController } from './participant-status.controller';
import { ParticipantStatusRepository } from './participant-status.repository';
import { ParticipantStatusService } from './participant-status.service';

@Module({
  controllers: [ParticipantStatusController],
  providers: [ParticipantStatusService, ParticipantStatusRepository],
  exports: [ParticipantStatusService],
})
export class ParticipantStatusModule {}
