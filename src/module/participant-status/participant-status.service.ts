import { Injectable, NotFoundException } from '@nestjs/common';
import type { ParticipantStatusCode } from 'src/module/ride/ride.constants';
import type { ParticipantStatusSchema } from 'src/utils/schemas/participant-status.schema';
import { ParticipantStatusRepository } from './participant-status.repository';

@Injectable()
export class ParticipantStatusService {
  constructor(private readonly repository: ParticipantStatusRepository) {}

  async findActive(): Promise<ParticipantStatusSchema[]> {
    return (await this.repository.findActive()) as ParticipantStatusSchema[];
  }

  async getActiveByCode(
    code: ParticipantStatusCode,
  ): Promise<ParticipantStatusSchema> {
    const status = await this.repository.findActiveByCode(code);
    if (!status) {
      throw new NotFoundException(
        'Status de participação não encontrado ou inativo.',
      );
    }
    return status as ParticipantStatusSchema;
  }
}
