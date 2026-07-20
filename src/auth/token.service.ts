import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthTokens, JwtPayload } from 'src/utils/types/auth/auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async generateTokens(
    userId: string,
    login: string,
    admin: boolean,
  ): Promise<AuthTokens> {
    const accessExpiresInRaw = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresInRaw = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    if (!accessExpiresInRaw || !refreshExpiresInRaw) {
      throw new Error('Tempos de expiração do JWT não definidos no .env');
    }

    const accessTokenExpiresIn = parseInt(accessExpiresInRaw, 10);
    const refreshTokenExpiresIn = parseInt(refreshExpiresInRaw, 10);

    // 2. BUSCANDO OS SECRETS
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const accessTokenJti = crypto.randomUUID();
    const refreshTokenJti = crypto.randomUUID();

    const accessPayload: JwtPayload = {
      sub: userId,
      login,
      admin,
      type: 'access',
      jti: accessTokenJti,
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      login,
      admin,
      type: 'refresh',
      jti: refreshTokenJti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
    };
  }

  async verifyToken(
    token: string,
    expectedType: 'access' | 'refresh',
  ): Promise<JwtPayload> {
    try {
      const secret =
        expectedType === 'access'
          ? this.configService.get<string>('JWT_ACCESS_SECRET')
          : this.configService.get<string>('JWT_REFRESH_SECRET');

      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      if (payload.type !== expectedType) {
        throw new UnauthorizedException(
          `Token inválido: esperado tipo ${expectedType}`,
        );
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
