import type { PrismaClient } from 'generated/prisma/client';
import { AuthRepository } from './auth.repository';

const signupData = {
  login: 'estudante@universidade.edu.br',
  password: 'senha123',
  confirmPassword: 'senha123',
  studentProfile: {
    name: 'Estudante Teste',
    registration: '20260001',
    courseId: '22222222-2222-4222-8222-222222222222',
  },
};

type CreateUserArgument = {
  data: {
    login: string;
    password: string;
    roleId: string;
    active: boolean;
    studentProfile: {
      create: {
        name: string;
        registration: string;
        courseId: string;
        active: boolean;
      };
    };
  };
  select: object;
};

describe('AuthRepository', () => {
  const transaction = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn<Promise<unknown>, [CreateUserArgument]>(),
    },
    role: {
      findFirst: jest.fn(),
    },
    course: {
      findFirst: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(
      (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  };

  const repository = new AuthRepository(prisma as unknown as PrismaClient);

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.user.findFirst.mockResolvedValue(null);
    transaction.role.findFirst.mockResolvedValue({ id: 'role-id' });
    transaction.course.findFirst.mockResolvedValue({
      id: signupData.studentProfile.courseId,
    });
  });

  it('creates the active user and profile inside one transaction', async () => {
    let createArgument: CreateUserArgument | undefined;
    const createdUser = {
      id: 'user-id',
      login: signupData.login,
      role: { id: 'role-id', code: 'USER', name: 'Usuário', active: true },
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    transaction.user.create.mockImplementation(
      (argument: CreateUserArgument): Promise<unknown> => {
        createArgument = argument;
        return Promise.resolve(createdUser);
      },
    );

    await expect(repository.createStudentAccount(signupData)).resolves.toEqual({
      status: 'created',
      user: createdUser,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(createArgument?.data).toMatchObject({
      login: signupData.login,
      roleId: 'role-id',
      active: true,
      studentProfile: {
        create: {
          name: signupData.studentProfile.name,
          registration: signupData.studentProfile.registration,
          courseId: signupData.studentProfile.courseId,
          active: true,
        },
      },
    });
  });

  it('does not create either record when the course is unavailable', async () => {
    transaction.course.findFirst.mockResolvedValue(null);

    await expect(repository.createStudentAccount(signupData)).resolves.toEqual({
      status: 'course_unavailable',
    });
    expect(transaction.user.create).not.toHaveBeenCalled();
  });

  it('propagates creation failures so Prisma can roll back the transaction', async () => {
    transaction.user.create.mockRejectedValue(new Error('database failure'));

    await expect(repository.createStudentAccount(signupData)).rejects.toThrow(
      'database failure',
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
