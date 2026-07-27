import { Prisma } from 'generated/prisma/client';

// Prisma;
// User
export const USER_SELECT: Prisma.UserSelect = {
  id: true,
  login: true,
  role: {
    select: {
      id: true,
      code: true,
      name: true,
      active: true,
    },
  },
  active: true,
  updatedAt: true,
  createdAt: true,
};

export const authenticationUserSelect = {
  id: true,
  login: true,
  password: true,
  role: {
    select: {
      code: true,
    },
  },
  active: true,
} satisfies Prisma.UserSelect;

export const ROLE_SELECT = {
  id: true,
  code: true,
  name: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RoleSelect;
