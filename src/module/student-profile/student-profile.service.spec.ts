import { ConflictException, NotFoundException } from '@nestjs/common';
import { CourseService } from 'src/module/course/course.service';
import { UserService } from 'src/module/user/user.service';
import { createStudentProfileSchema } from 'src/utils/schemas/student-profile.schema';
import { StudentProfileRepository } from './student-profile.repository';
import { StudentProfileService } from './student-profile.service';

describe('StudentProfileService', () => {
  const repository = {
    findByUserId: jest.fn(),
    create: jest.fn(),
  };
  const courseService = { getActiveForRelation: jest.fn() };
  const userService = { assertActive: jest.fn() };
  const service = new StudentProfileService(
    repository as unknown as StudentProfileRepository,
    courseService as unknown as CourseService,
    userService as unknown as UserService,
  );
  const data = {
    name: 'Estudante Teste',
    courseId: '85f45fb4-3bf9-4a53-a685-5eb63572d61e',
    registration: '20260001',
  };

  beforeEach(() => jest.clearAllMocks());

  it('exige matrícula', () => {
    expect(
      createStudentProfileSchema.safeParse({
        courseId: data.courseId,
        registration: ' ',
      }).success,
    ).toBe(false);
  });

  it('exige nome do estudante', () => {
    expect(
      createStudentProfileSchema.safeParse({ ...data, name: ' ' }).success,
    ).toBe(false);
  });

  it('impede um segundo perfil para o mesmo usuário', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findByUserId.mockResolvedValue({ id: 'existing-id' });
    await expect(service.create('user-id', data)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejeita curso inativo ou inexistente', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findByUserId.mockResolvedValue(null);
    courseService.getActiveForRelation.mockRejectedValue(
      new NotFoundException(),
    );
    await expect(service.create('user-id', data)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
