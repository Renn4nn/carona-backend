import { Module } from '@nestjs/common';
import { RideStatusController } from './ride-status.controller';
import { RideStatusRepository } from './ride-status.repository';
import { RideStatusService } from './ride-status.service';

@Module({
  controllers: [RideStatusController],
  providers: [RideStatusService, RideStatusRepository],
  exports: [RideStatusService],
})
export class RideStatusModule {}
