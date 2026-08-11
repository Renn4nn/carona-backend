import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaymentMethodSchema } from 'src/utils/schemas/payment-method.schema';
import { PaymentMethodRepository } from './payment-method.repository';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  async findActive(): Promise<PaymentMethodSchema[]> {
    return (await this.repository.findActive()) as PaymentMethodSchema[];
  }

  async getActiveById(id: string): Promise<PaymentMethodSchema> {
    const method = await this.repository.findActiveById(id);
    if (!method) {
      throw new NotFoundException(
        'Método de pagamento não encontrado ou inativo.',
      );
    }
    return method as PaymentMethodSchema;
  }
}
