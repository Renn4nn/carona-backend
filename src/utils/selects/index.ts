import type { Prisma } from 'generated/prisma/client';

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

export const UNIVERSITY_SELECT = {
  id: true,
  name: true,
  city: true,
  state: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UniversitySelect;

export const COURSE_SELECT = {
  id: true,
  universityId: true,
  name: true,
  active: true,
  university: {
    select: UNIVERSITY_SELECT,
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CourseSelect;

export const STUDENT_PROFILE_SELECT = {
  id: true,
  userId: true,
  courseId: true,
  registration: true,
  active: true,
  course: {
    select: COURSE_SELECT,
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StudentProfileSelect;

export const VEHICLE_SELECT = {
  id: true,
  ownerId: true,
  brand: true,
  model: true,
  color: true,
  plate: true,
  year: true,
  passengerCapacity: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VehicleSelect;
