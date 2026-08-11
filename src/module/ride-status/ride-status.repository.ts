import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import type { RideStatusCode } from 'src/module/ride/ride.constants';
import { RIDE_STATUS_SELECT } from 'src/utils/selects';

@Injectable()
export class RideStatusRepository {
  constructor(@Inject('PrismaService') private readonly prisma: PrismaClient) {}

  findActive() {
    return this.prisma.rideStatus.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      select: RIDE_STATUS_SELECT,
    });
  }

  findActiveByCode(code: RideStatusCode) {
    return this.prisma.rideStatus.findFirst({
      where: { code, active: true },
      select: RIDE_STATUS_SELECT,
    });
  }
}
