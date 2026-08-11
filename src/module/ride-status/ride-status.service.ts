import { Injectable, NotFoundException } from '@nestjs/common';
import type { RideStatusCode } from 'src/module/ride/ride.constants';
import type { RideStatusSchema } from 'src/utils/schemas/ride-status.schema';
import { RideStatusRepository } from './ride-status.repository';

@Injectable()
export class RideStatusService {
  constructor(private readonly repository: RideStatusRepository) {}

  async findActive(): Promise<RideStatusSchema[]> {
    return (await this.repository.findActive()) as RideStatusSchema[];
  }

  async getActiveByCode(code: RideStatusCode): Promise<RideStatusSchema> {
    const status = await this.repository.findActiveByCode(code);
    if (!status) {
      throw new NotFoundException(
        'Status de carona não encontrado ou inativo.',
      );
    }
    return status as RideStatusSchema;
  }
}
