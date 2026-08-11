import { Module } from '@nestjs/common';
import { UserModule } from 'src/module/user/user.module';
import {
  AdminUniversityController,
  UniversityController,
} from './university.controller';
import { UniversityRepository } from './university.repository';
import { UniversityService } from './university.service';

@Module({
  imports: [UserModule],
  controllers: [UniversityController, AdminUniversityController],
  providers: [UniversityService, UniversityRepository],
  exports: [UniversityService],
})
export class UniversityModule {}
