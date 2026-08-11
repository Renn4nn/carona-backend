import { Module } from '@nestjs/common';
import { UserModule } from 'src/module/user/user.module';
import { VehicleController } from './vehicle.controller';
import { VehicleRepository } from './vehicle.repository';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [UserModule],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository],
})
export class VehicleModule {}
