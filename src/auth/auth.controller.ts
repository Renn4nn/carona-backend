import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, RegisterUserDto } from 'src/utils/schemas/user.schema';
import type {
  ApiMessageResponse,
  ApiSuccessResponse,
} from 'src/utils/types/api/api';
import { AuthResult } from 'src/utils/types/auth/auth';

interface RequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Configuração padrão de cookie seguro
  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true, // Protege contra XSS
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'strict', // Protege contra CSRF
      maxAge: 20 * 24 * 60 * 60 * 1000, // 20 dias em milissegundos
    });
  }

  @Post('signup')
  async signUp(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiSuccessResponse<AuthResult>> {
    const { refreshToken, ...result } = await this.authService.signUp(dto);
    this.setRefreshCookie(response, refreshToken);
    return { data: result };
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiSuccessResponse<AuthResult>> {
    const { refreshToken, ...result } = await this.authService.signIn(dto);
    this.setRefreshCookie(response, refreshToken);
    return { data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiSuccessResponse<AuthResult>> {
    // Busca o cookie enviado automaticamente pelo navegador
    const currentRefreshToken = request.cookies?.['refreshToken'];

    if (!currentRefreshToken) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    const { refreshToken, ...result } =
      await this.authService.refresh(currentRefreshToken);
    this.setRefreshCookie(response, refreshToken); // Rotaciona o refresh token para manter a sessão ativa
    return { data: result };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Res({ passthrough: true }) response: Response,
  ): ApiMessageResponse<string> {
    // Limpa o cookie de refresh token na saída do usuário
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return { data: 'Sessão encerrada com sucesso!' };
  }
}
