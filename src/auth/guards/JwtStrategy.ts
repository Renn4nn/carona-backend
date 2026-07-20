import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../../utils/types/auth/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const accessSecret =
      configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessSecret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Token inválido.');
    }

    return {
      userId: payload.sub,
      login: payload.login,
      admin: payload.admin,
    };
  }
}