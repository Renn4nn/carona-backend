import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import {
  ZodSerializationExceptionFilter,
  ZodValidationExceptionFilter,
  PrismaClientExceptionFilter,
  HttpExceptionFilter,
} from './utils/filters';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomPrismaModule, PrismaClientFactory } from './utils/extensions';
import { UserModule } from './module/user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './module/role/role.module';
import { UniversityModule } from './module/university/university.module';
import { CourseModule } from './module/course/course.module';
import { StudentProfileModule } from './module/student-profile/student-profile.module';
import { VehicleModule } from './module/vehicle/vehicle.module';
import { RideStatusModule } from './module/ride-status/ride-status.module';
import { ParticipantStatusModule } from './module/participant-status/participant-status.module';
import { PaymentMethodModule } from './module/payment-method/payment-method.module';
import { RideModule } from './module/ride/ride.module';
import { RideParticipantModule } from './module/ride-participant/ride-participant.module';
import { GeoModule } from './module/geo/geo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      isGlobal: true,
      useFactory: PrismaClientFactory,
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    RoleModule,
    UniversityModule,
    CourseModule,
    StudentProfileModule,
    VehicleModule,
    RideStatusModule,
    ParticipantStatusModule,
    PaymentMethodModule,
    RideModule,
    RideParticipantModule,
    GeoModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    // ORDEM DOS FILTROS (O último é o primeiro a tentar capturar)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // Filtro genérico (fallback)
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter, // Filtro de Banco
    },
    {
      provide: APP_FILTER,
      useClass: ZodSerializationExceptionFilter, // Filtro de saída
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter, // Filtro de entrada (Zod)
    },
  ],
})
export class AppModule {}
