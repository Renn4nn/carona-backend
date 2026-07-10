import { Prisma } from 'generated/prisma/client';

// Prisma;
// User
export const USER_SELECT: Prisma.UserSelect = {
  id: true,
  login: true,
  admin: true,
  active: true,
  updatedAt: true,
  createdAt: true,
};
