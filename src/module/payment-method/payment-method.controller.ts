import { Controller, Get } from '@nestjs/common';
import type { PaymentMethodSchema } from 'src/utils/schemas/payment-method.schema';
import type { ApiSuccessResponse } from 'src/utils/types/api/api';
import { PaymentMethodService } from './payment-method.service';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Get()
  async findActive(): Promise<ApiSuccessResponse<PaymentMethodSchema[]>> {
    return { data: await this.service.findActive() };
  }
}
