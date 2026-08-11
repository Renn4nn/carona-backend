import { ConflictException, ForbiddenException } from '@nestjs/common';
import { UserService } from 'src/module/user/user.service';
import { UniversityRepository } from './university.repository';
import { UniversityService } from './university.service';

describe('UniversityService', () => {
  const repository = {
    findMany: jest.fn(),
    findByIdentity: jest.fn(),
    create: jest.fn(),
  };
  const userService = { assertAdmin: jest.fn() };
  const service = new UniversityService(
    repository as unknown as UniversityRepository,
    userService as unknown as UserService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('mantém o catálogo público restrito a universidades ativas', async () => {
    repository.findMany.mockResolvedValue([]);
    await service.findPublicMany({});
    expect(repository.findMany).toHaveBeenCalledWith({}, true);
  });

  it('bloqueia mutação quando o usuário não é ADMIN', async () => {
    userService.assertAdmin.mockRejectedValue(new ForbiddenException());
    await expect(
      service.create('user-id', {
        name: 'Universidade Federal',
        city: 'São Paulo',
        state: 'SP',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejeita universidade duplicada', async () => {
    userService.assertAdmin.mockResolvedValue({});
    repository.findByIdentity.mockResolvedValue({ id: 'existing-id' });
    await expect(
      service.create('admin-id', {
        name: 'Universidade Federal',
        city: 'São Paulo',
        state: 'SP',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
