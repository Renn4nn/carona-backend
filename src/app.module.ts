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
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';

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
