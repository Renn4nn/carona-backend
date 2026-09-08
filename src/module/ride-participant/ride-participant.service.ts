import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipantStatusService } from 'src/module/participant-status/participant-status.service';
import {
  PARTICIPANT_STATUS,
  RIDE_STATUS,
} from 'src/module/ride/ride.constants';
import { RideService } from 'src/module/ride/ride.service';
import { UserService } from 'src/module/user/user.service';
import type {
  CancelRideParticipantSchema,
  CreateRideParticipantSchema,
  MyRideParticipationSchema,
  RideParticipantSchema,
  RideParticipationQuerySchema,
} from 'src/utils/schemas/ride-participant.schema';
import type { CursorPage } from 'src/utils/types/api/api';
import {
  mapMyRideParticipation,
  mapRideParticipant,
  type RideParticipantRecord,
} from './ride-participant.mapper';
import { RideParticipantRepository } from './ride-participant.repository';

@Injectable()
export class RideParticipantService {
  constructor(
    private readonly repository: RideParticipantRepository,
    private readonly rideService: RideService,
    private readonly userService: UserService,
    private readonly participantStatusService: ParticipantStatusService,
  ) {}

  async request(
    userId: string,
    rideId: string,
    data: CreateRideParticipantSchema,
  ): Promise<RideParticipantSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.rideService.getExistingForParticipant(rideId);
    if (ride.driverId === userId) {
      throw new ConflictException(
        'O motorista não pode solicitar a própria carona.',
      );
    }
    if (
      ride.status.code !== RIDE_STATUS.OPEN ||
      ride.departureAt <= new Date()
    ) {
      throw new ConflictException('Esta carona não aceita novas solicitações.');
    }
    if (ride.availableSeats === 0) {
      throw new ConflictException('Esta carona não possui vagas disponíveis.');
    }
    const existing = await this.repository.findByRideAndUser(rideId, userId);
    if (existing) {
      throw new ConflictException(
        'Você já possui uma solicitação nesta carona.',
      );
    }
    const status = await this.participantStatusService.getActiveByCode(
      PARTICIPANT_STATUS.PENDING,
    );
    return mapRideParticipant(
      await this.repository.create(rideId, userId, status.id, data),
    );
  }

  async findByRide(
    userId: string,
    rideId: string,
  ): Promise<RideParticipantSchema[]> {
    await this.userService.assertActive(userId);
    const ride = await this.rideService.getExistingForParticipant(rideId);
    this.assertDriver(userId, ride.driverId);
    return (await this.repository.findByRide(rideId)).map(mapRideParticipant);
  }

  getExistingForRoute(rideId: string) {
    return this.rideService.getExistingForParticipant(rideId);
  }

  async findMine(
    userId: string,
    query: RideParticipationQuerySchema,
  ): Promise<CursorPage<MyRideParticipationSchema>> {
    await this.userService.assertActive(userId);
    const records = await this.repository.findMine(userId, query);
    const hasNextPage = records.length > query.limit;
    const page = hasNextPage ? records.slice(0, query.limit) : records;
    return {
      items: page.map(mapMyRideParticipation),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (page.at(-1)?.id ?? null) : null,
      },
    };
  }

  async accept(
    userId: string,
    rideId: string,
    participantId: string,
  ): Promise<RideParticipantSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.rideService.getExistingForParticipant(rideId);
    this.assertDriver(userId, ride.driverId);
    if (ride.status.code !== RIDE_STATUS.OPEN) {
      throw new ConflictException('A carona não está aberta.');
    }
    const participant = await this.getExisting(participantId, rideId);
    if (participant.status.code !== PARTICIPANT_STATUS.PENDING) {
      throw new ConflictException('A solicitação não está pendente.');
    }
    await this.userService.assertActive(participant.userId);
    const status = await this.participantStatusService.getActiveByCode(
      PARTICIPANT_STATUS.ACCEPTED,
    );
    const updated = await this.repository.accept(
      rideId,
      participantId,
      status.id,
    );
    if (!updated) {
      throw new ConflictException(
        'A solicitação já foi alterada ou não há vagas disponíveis.',
      );
    }
    return mapRideParticipant(updated);
  }

  async reject(
    userId: string,
    rideId: string,
    participantId: string,
  ): Promise<RideParticipantSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.rideService.getExistingForParticipant(rideId);
    this.assertDriver(userId, ride.driverId);
    if (ride.status.code !== RIDE_STATUS.OPEN) {
      throw new ConflictException('A carona não está aberta.');
    }
    const participant = await this.getExisting(participantId, rideId);
    if (participant.status.code !== PARTICIPANT_STATUS.PENDING) {
      throw new ConflictException('A solicitação não está pendente.');
    }
    const status = await this.participantStatusService.getActiveByCode(
      PARTICIPANT_STATUS.REJECTED,
    );
    const updated = await this.repository.reject(
      rideId,
      participantId,
      status.id,
    );
    if (!updated) throw new ConflictException('A solicitação já foi alterada.');
    return mapRideParticipant(updated);
  }

  async cancelMine(
    userId: string,
    rideId: string,
    data: CancelRideParticipantSchema,
  ): Promise<RideParticipantSchema> {
    await this.userService.assertActive(userId);
    const [ride, participant] = await Promise.all([
      this.rideService.getExistingForParticipant(rideId),
      this.repository.findByRideAndUser(rideId, userId),
    ]);
    if (!participant) {
      throw new NotFoundException('Participação não encontrada.');
    }
    const status = await this.participantStatusService.getActiveByCode(
      PARTICIPANT_STATUS.CANCELED,
    );

    let updated: RideParticipantRecord | null;
    if (participant.status.code === PARTICIPANT_STATUS.PENDING) {
      updated = await this.repository.cancelPending(
        rideId,
        userId,
        status.id,
        data,
      );
    } else if (participant.status.code === PARTICIPANT_STATUS.ACCEPTED) {
      if (ride.status.code !== RIDE_STATUS.OPEN) {
        throw new ConflictException(
          'Não é possível cancelar uma vaga após o início da carona.',
        );
      }
      updated = await this.repository.cancelAccepted(
        rideId,
        userId,
        status.id,
        data,
      );
    } else {
      throw new ConflictException('Esta participação não pode ser cancelada.');
    }

    if (!updated)
      throw new ConflictException('A participação já foi alterada.');
    return mapRideParticipant(updated);
  }

  private async getExisting(participantId: string, rideId: string) {
    const participant = await this.repository.findById(participantId);
    if (!participant || participant.rideId !== rideId) {
      throw new NotFoundException('Participação não encontrada.');
    }
    return participant;
  }

  private assertDriver(userId: string, driverId: string) {
    if (userId !== driverId) {
      throw new ForbiddenException(
        'Apenas o motorista pode realizar esta ação.',
      );
    }
  }
}
