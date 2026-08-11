import { Module } from '@nestjs/common';
import { UniversityModule } from 'src/module/university/university.module';
import { UserModule } from 'src/module/user/user.module';
import { AdminCourseController, CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';

@Module({
  imports: [UserModule, UniversityModule],
  controllers: [CourseController, AdminCourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService],
})
export class CourseModule {}
