import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import { PAYMENT_METHOD_SELECT } from 'src/utils/selects';

@Injectable()
export class PaymentMethodRepository {
  constructor(@Inject('PrismaService') private readonly prisma: PrismaClient) {}

  findActive() {
    return this.prisma.paymentMethod.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      select: PAYMENT_METHOD_SELECT,
    });
  }

  findActiveById(id: string) {
    return this.prisma.paymentMethod.findFirst({
      where: { id, active: true },
      select: PAYMENT_METHOD_SELECT,
    });
  }
}
