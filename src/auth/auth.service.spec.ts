import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { registerUserSchema } from 'src/utils/schemas/user.schema';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  const repository = {
    createStudentAccount: jest.fn(),
  };
  const tokenService = {
    generateTokens: jest.fn(),
  };
  const service = new AuthService(
    repository as unknown as AuthRepository,
    tokenService as unknown as TokenService,
  );
  const registration = {
    login: 'estudante@universidade.edu.br',
    password: 'senha123',
    confirmPassword: 'senha123',
    studentProfile: {
      name: 'Estudante Teste',
      registration: '20260001',
      courseId: '85f45fb4-3bf9-4a53-a685-5eb63572d61e',
    },
  };

  beforeEach(() => jest.clearAllMocks());

  it('exige e-mail válido e dados acadêmicos completos', () => {
    expect(
      registerUserSchema.safeParse({ ...registration, login: 'usuario' })
        .success,
    ).toBe(false);
    expect(
      registerUserSchema.safeParse({
        ...registration,
        studentProfile: { ...registration.studentProfile, name: ' ' },
      }).success,
    ).toBe(false);
  });

  it('normaliza o e-mail do cadastro', () => {
    const parsed = registerUserSchema.parse({
      ...registration,
      login: '  ESTUDANTE@UNIVERSIDADE.EDU.BR ',
    });
    expect(parsed.login).toBe('estudante@universidade.edu.br');
  });

  it('emite tokens somente depois da criação do usuário e perfil', async () => {
    repository.createStudentAccount.mockResolvedValue({
      status: 'created',
      user: {
        id: 'user-id',
        login: registration.login,
        role: { code: 'USER' },
      },
    });
    tokenService.generateTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    });

    const result = await service.signUp(registration);

    expect(repository.createStudentAccount).toHaveBeenCalledWith(registration);
    expect(tokenService.generateTokens).toHaveBeenCalledWith(
      'user-id',
      registration.login,
      'USER',
    );
    expect(result.user.id).toBe('user-id');
  });

  it.each([
    ['login_taken', ConflictException],
    ['course_unavailable', NotFoundException],
    ['role_unavailable', ServiceUnavailableException],
  ] as const)(
    'não emite tokens quando o resultado é %s',
    async (status, error) => {
      repository.createStudentAccount.mockResolvedValue({ status });

      await expect(service.signUp(registration)).rejects.toBeInstanceOf(error);
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    },
  );
});
