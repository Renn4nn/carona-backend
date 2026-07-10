import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../utils/types/auth/auth';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'default-secret-change-in-production',
      algorithms: ['HS256'],
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      login: payload.login,
      admin: payload.admin,
    };
  }
}
