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
  name: true,
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

export const RIDE_STATUS_SELECT = {
  id: true,
  code: true,
  name: true,
  description: true,
  active: true,
  displayOrder: true,
} satisfies Prisma.RideStatusSelect;

export const PARTICIPANT_STATUS_SELECT = {
  id: true,
  code: true,
  name: true,
  description: true,
  active: true,
  displayOrder: true,
} satisfies Prisma.ParticipantStatusSelect;

export const PAYMENT_METHOD_SELECT = {
  id: true,
  code: true,
  name: true,
  description: true,
  active: true,
  displayOrder: true,
} satisfies Prisma.PaymentMethodSelect;

export const RIDE_PUBLIC_SELECT = {
  id: true,
  status: { select: RIDE_STATUS_SELECT },
  originName: true,
  destinationName: true,
  departureAt: true,
  estimatedArrivalAt: true,
  totalSeats: true,
  availableSeats: true,
  contributionPerSeat: true,
  paymentMethod: { select: PAYMENT_METHOD_SELECT },
} satisfies Prisma.RideSelect;

export const RIDE_DETAIL_SELECT = {
  ...RIDE_PUBLIC_SELECT,
  driverId: true,
  vehicleId: true,
  paymentMethodId: true,
  driver: { select: { id: true, login: true } },
  vehicle: {
    select: {
      id: true,
      ownerId: true,
      brand: true,
      model: true,
      color: true,
      year: true,
      passengerCapacity: true,
      active: true,
    },
  },
  originAddress: true,
  originLatitude: true,
  originLongitude: true,
  destinationAddress: true,
  destinationLatitude: true,
  destinationLongitude: true,
  paymentNotes: true,
  description: true,
  rules: true,
  startedAt: true,
  completedAt: true,
  canceledAt: true,
  cancellationReason: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RideSelect;

export const RIDE_PARTICIPANT_SELECT = {
  id: true,
  rideId: true,
  userId: true,
  user: { select: { id: true, login: true } },
  status: { select: PARTICIPANT_STATUS_SELECT },
  message: true,
  requestedAt: true,
  respondedAt: true,
  canceledAt: true,
  completedAt: true,
  cancellationReason: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RideParticipantSelect;

export const MY_RIDE_PARTICIPATION_SELECT = {
  ...RIDE_PARTICIPANT_SELECT,
  ride: { select: RIDE_PUBLIC_SELECT },
} satisfies Prisma.RideParticipantSelect;
