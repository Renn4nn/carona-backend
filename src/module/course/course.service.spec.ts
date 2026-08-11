import { ConflictException, NotFoundException } from '@nestjs/common';
import { UniversityService } from 'src/module/university/university.service';
import { UserService } from 'src/module/user/user.service';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';

describe('CourseService', () => {
  const repository = {
    findByIdentity: jest.fn(),
    create: jest.fn(),
  };
  const universityService = { getActiveForRelation: jest.fn() };
  const userService = { assertAdmin: jest.fn() };
  const service = new CourseService(
    repository as unknown as CourseRepository,
    universityService as unknown as UniversityService,
    userService as unknown as UserService,
  );
  const data = {
    universityId: '85f45fb4-3bf9-4a53-a685-5eb63572d61e',
    name: 'Engenharia de Software',
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejeita criação quando a universidade não está ativa', async () => {
    userService.assertAdmin.mockResolvedValue({});
    universityService.getActiveForRelation.mockRejectedValue(
      new NotFoundException(),
    );
    await expect(service.create('admin-id', data)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejeita curso duplicado na mesma universidade', async () => {
    userService.assertAdmin.mockResolvedValue({});
    universityService.getActiveForRelation.mockResolvedValue({});
    repository.findByIdentity.mockResolvedValue({ id: 'existing-id' });
    await expect(service.create('admin-id', data)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
