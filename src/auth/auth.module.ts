import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';

@Module({
  imports: [ConfigModule.forRoot(), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule {}
