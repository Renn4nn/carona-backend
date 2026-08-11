export const RIDE_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export const PARTICIPANT_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED',
  COMPLETED: 'COMPLETED',
} as const;

export type RideStatusCode = (typeof RIDE_STATUS)[keyof typeof RIDE_STATUS];
export type ParticipantStatusCode =
  (typeof PARTICIPANT_STATUS)[keyof typeof PARTICIPANT_STATUS];
