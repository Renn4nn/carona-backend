import { Module } from '@nestjs/common';
import { CourseModule } from 'src/module/course/course.module';
import { UserModule } from 'src/module/user/user.module';
import { StudentProfileController } from './student-profile.controller';
import { StudentProfileRepository } from './student-profile.repository';
import { StudentProfileService } from './student-profile.service';

@Module({
  imports: [UserModule, CourseModule],
  controllers: [StudentProfileController],
  providers: [StudentProfileService, StudentProfileRepository],
})
export class StudentProfileModule {}
