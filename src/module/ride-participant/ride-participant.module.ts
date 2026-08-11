import { Module } from '@nestjs/common';
import { ParticipantStatusModule } from 'src/module/participant-status/participant-status.module';
import { RideModule } from 'src/module/ride/ride.module';
import { UserModule } from 'src/module/user/user.module';
import { RideParticipantController } from './ride-participant.controller';
import { RideParticipantRepository } from './ride-participant.repository';
import { RideParticipantService } from './ride-participant.service';

@Module({
  imports: [UserModule, RideModule, ParticipantStatusModule],
  controllers: [RideParticipantController],
  providers: [RideParticipantService, RideParticipantRepository],
})
export class RideParticipantModule {}
