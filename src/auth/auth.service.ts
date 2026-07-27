import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from 'src/utils/schemas/user.schema';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { AuthResult } from 'src/utils/types/auth/auth';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async signUp(
    data: RegisterUserDto,
  ): Promise<AuthResult & { refreshToken: string }> {
    const userExists = await this.authRepository.findByLogin(data.login);
    if (userExists) {
      throw new ConflictException('Este usuário já está cadastrado!');
    }

    const { confirmPassword, ...userData } = data;
    void confirmPassword;

    const newUser = await this.authRepository.createUser(userData);
    const tokens = await this.tokenService.generateTokens(
      newUser.id,
      newUser.login,
      newUser.role.code,
    );

    return {
      user: {
        id: newUser.id,
        login: newUser.login,
        role: newUser.role.code,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async signIn(
    data: CreateUserDto,
  ): Promise<AuthResult & { refreshToken: string }> {
    const user = await this.authRepository.findByLogin(data.login);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.login,
      user.role.code,
    );

    return {
      user: {
        id: user.id,
        login: user.login,
        role: user.role.code,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async refresh(
    refreshToken: string,
  ): Promise<AuthResult & { refreshToken: string }> {
    const payload = await this.tokenService.verifyToken(
      refreshToken,
      'refresh',
    );

    // Verifica se o dono do token ainda existe/está ativo no banco
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    // Gera o novo par de tokens
    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.login,
      user.role.code,
    );

    return {
      user: { id: user.id, login: user.login, role: user.role.code },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }
}
