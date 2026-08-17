import { Module } from '@nestjs/common';
import { ParticipantStatusModule } from 'src/module/participant-status/participant-status.module';
import { RideStatusModule } from 'src/module/ride-status/ride-status.module';
import { UserModule } from 'src/module/user/user.module';
import { VehicleModule } from 'src/module/vehicle/vehicle.module';
import { PublicRideController, RideController } from './ride.controller';
import { RideRepository } from './ride.repository';
import { RideService } from './ride.service';

@Module({
  imports: [
    UserModule,
    VehicleModule,
    RideStatusModule,
    ParticipantStatusModule,
  ],
  controllers: [PublicRideController, RideController],
  providers: [RideService, RideRepository],
  exports: [RideService],
})
export class RideModule {}
