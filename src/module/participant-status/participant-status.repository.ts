import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import type { ParticipantStatusCode } from 'src/module/ride/ride.constants';
import { PARTICIPANT_STATUS_SELECT } from 'src/utils/selects';

@Injectable()
export class ParticipantStatusRepository {
  constructor(@Inject('PrismaService') private readonly prisma: PrismaClient) {}

  findActive() {
    return this.prisma.participantStatus.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      select: PARTICIPANT_STATUS_SELECT,
    });
  }

  findActiveByCode(code: ParticipantStatusCode) {
    return this.prisma.participantStatus.findFirst({
      where: { code, active: true },
      select: PARTICIPANT_STATUS_SELECT,
    });
  }
}
