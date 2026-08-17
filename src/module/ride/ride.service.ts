import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipantStatusService } from 'src/module/participant-status/participant-status.service';
import { RideStatusService } from 'src/module/ride-status/ride-status.service';
import { UserService } from 'src/module/user/user.service';
import { VehicleService } from 'src/module/vehicle/vehicle.service';
import type {
  CancelRideSchema,
  CreateRideSchema,
  MineRideQuerySchema,
  PublicRideSchema,
  RideQuerySchema,
  RideSchema,
  UpdateRideSchema,
} from 'src/utils/schemas/ride.schema';
import type { CursorPage } from 'src/utils/types/api/api';
import { PARTICIPANT_STATUS, RIDE_STATUS } from './ride.constants';
import { mapPublicRide, mapRide, type RideDetailRecord } from './ride.mapper';
import { RideRepository } from './ride.repository';

const STRUCTURAL_FIELDS: (keyof UpdateRideSchema)[] = [
  'vehicleId',
  'originAddress',
  'originLatitude',
  'originLongitude',
  'destinationAddress',
  'destinationLatitude',
  'destinationLongitude',
  'departureAt',
];

@Injectable()
export class RideService {
  constructor(
    private readonly repository: RideRepository,
    private readonly userService: UserService,
    private readonly vehicleService: VehicleService,
    private readonly rideStatusService: RideStatusService,
    private readonly participantStatusService: ParticipantStatusService,
  ) {}

  async findPublicMany(
    query: RideQuerySchema,
  ): Promise<CursorPage<PublicRideSchema>> {
    this.validateQueryRange(query);
    const records = await this.repository.findPublicMany(query);
    return this.mapPage(records, query.limit, mapPublicRide);
  }

  async findPublicById(id: string): Promise<PublicRideSchema> {
    const ride = await this.repository.findPublicById(id);
    if (!ride) throw new NotFoundException('Carona não encontrada.');
    return mapPublicRide(ride);
  }

  async findMany(
    userId: string,
    query: RideQuerySchema,
  ): Promise<CursorPage<RideSchema>> {
    await this.userService.assertActive(userId);
    this.validateQueryRange(query);
    const records = await this.repository.findMany(query);
    return this.mapPage(records, query.limit, mapRide);
  }

  async findMine(
    userId: string,
    query: MineRideQuerySchema,
  ): Promise<CursorPage<RideSchema>> {
    await this.userService.assertActive(userId);
    this.validateQueryRange(query);
    const records = await this.repository.findMine(userId, query);
    return this.mapPage(records, query.limit, mapRide);
  }

  async findById(userId: string, id: string): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    return mapRide(await this.getExisting(id));
  }

  async create(userId: string, data: CreateRideSchema): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    const vehicle = await this.vehicleService.getActiveOwned(
      userId,
      data.vehicleId,
    );
    this.validateDeparture(new Date(data.departureAt));
    this.validateDistinctLocations(data.originAddress, data.destinationAddress);
    const status = await this.rideStatusService.getActiveByCode(
      RIDE_STATUS.OPEN,
    );
    return mapRide(
      await this.repository.create(
        userId,
        status.id,
        vehicle.passengerCapacity,
        data,
      ),
    );
  }

  async update(
    userId: string,
    id: string,
    data: UpdateRideSchema,
  ): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.getOwned(userId, id);
    if (ride.status.code !== RIDE_STATUS.OPEN) {
      throw new ConflictException(
        'Somente caronas abertas podem ser alteradas.',
      );
    }

    const acceptedCount = await this.repository.countAccepted(id);
    if (
      acceptedCount > 0 &&
      STRUCTURAL_FIELDS.some((field) => data[field] !== undefined)
    ) {
      throw new ConflictException(
        'Após aceitar passageiros, apenas as observações podem ser alteradas.',
      );
    }

    const vehicle = data.vehicleId
      ? await this.vehicleService.getActiveOwned(userId, data.vehicleId)
      : undefined;

    const departureAt = data.departureAt
      ? new Date(data.departureAt)
      : ride.departureAt;
    if (data.departureAt) this.validateDeparture(departureAt);
    const originLatitude =
      data.originLatitude ?? ride.originLatitude?.toNumber();
    const originLongitude =
      data.originLongitude ?? ride.originLongitude?.toNumber();
    const destinationLatitude =
      data.destinationLatitude ?? ride.destinationLatitude?.toNumber();
    const destinationLongitude =
      data.destinationLongitude ?? ride.destinationLongitude?.toNumber();
    this.validateCoordinatePair(originLatitude, originLongitude, 'origem');
    this.validateCoordinatePair(
      destinationLatitude,
      destinationLongitude,
      'destino',
    );

    this.validateDistinctLocations(
      data.originAddress ?? ride.originAddress,
      data.destinationAddress ?? ride.destinationAddress,
    );

    const updateData: UpdateRideSchema & {
      totalSeats?: number;
      availableSeats?: number;
    } = {
      ...data,
    };
    if (vehicle) {
      updateData.totalSeats = vehicle.passengerCapacity;
      updateData.availableSeats = vehicle.passengerCapacity;
    }
    return mapRide(await this.repository.update(id, updateData));
  }

  async start(userId: string, id: string): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.getOwned(userId, id);
    if (ride.status.code !== RIDE_STATUS.OPEN) {
      throw new ConflictException('A carona não está aberta para início.');
    }
    const status = await this.rideStatusService.getActiveByCode(
      RIDE_STATUS.IN_PROGRESS,
    );
    const updated = await this.repository.start(id, userId, status.id);
    if (!updated) throw new ConflictException('A carona já foi alterada.');
    return mapRide(updated);
  }

  async complete(userId: string, id: string): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.getOwned(userId, id);
    if (ride.status.code !== RIDE_STATUS.IN_PROGRESS) {
      throw new ConflictException('A carona não está em andamento.');
    }
    const [rideStatus, participantStatus] = await Promise.all([
      this.rideStatusService.getActiveByCode(RIDE_STATUS.COMPLETED),
      this.participantStatusService.getActiveByCode(
        PARTICIPANT_STATUS.COMPLETED,
      ),
    ]);
    const updated = await this.repository.complete(
      id,
      userId,
      rideStatus.id,
      participantStatus.id,
    );
    if (!updated) throw new ConflictException('A carona já foi alterada.');
    return mapRide(updated);
  }

  async cancel(
    userId: string,
    id: string,
    data: CancelRideSchema,
  ): Promise<RideSchema> {
    await this.userService.assertActive(userId);
    const ride = await this.getOwned(userId, id);
    if (
      ride.status.code !== RIDE_STATUS.OPEN &&
      ride.status.code !== RIDE_STATUS.IN_PROGRESS
    ) {
      throw new ConflictException('Esta carona não pode mais ser cancelada.');
    }
    const [rideStatus, participantStatus] = await Promise.all([
      this.rideStatusService.getActiveByCode(RIDE_STATUS.CANCELED),
      this.participantStatusService.getActiveByCode(
        PARTICIPANT_STATUS.CANCELED,
      ),
    ]);
    const updated = await this.repository.cancel(
      id,
      userId,
      data.reason,
      rideStatus.id,
      participantStatus.id,
    );
    if (!updated) throw new ConflictException('A carona já foi alterada.');
    return mapRide(updated);
  }

  async getExistingForParticipant(id: string): Promise<RideDetailRecord> {
    return this.getExisting(id);
  }

  private async getExisting(id: string): Promise<RideDetailRecord> {
    const ride = await this.repository.findById(id);
    if (!ride) throw new NotFoundException('Carona não encontrada.');
    return ride;
  }

  private async getOwned(
    userId: string,
    id: string,
  ): Promise<RideDetailRecord> {
    const ride = await this.getExisting(id);
    if (ride.driverId !== userId) {
      throw new ForbiddenException(
        'Apenas o motorista pode realizar esta ação.',
      );
    }
    return ride;
  }

  private mapPage<TRecord, TResult>(
    records: TRecord[],
    limit: number,
    mapper: (record: TRecord) => TResult,
  ): CursorPage<TResult> {
    const hasNextPage = records.length > limit;
    const page = hasNextPage ? records.slice(0, limit) : records;
    const last = page.at(-1) as (TRecord & { id: string }) | undefined;
    return {
      items: page.map(mapper),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage && last ? last.id : null,
      },
    };
  }

  private validateQueryRange(query: RideQuerySchema) {
    if (
      query.departureFrom &&
      query.departureTo &&
      new Date(query.departureFrom) > new Date(query.departureTo)
    ) {
      throw new BadRequestException(
        'Data inicial deve ser anterior à data final.',
      );
    }
  }

  private validateDeparture(departureAt: Date) {
    if (departureAt <= new Date()) {
      throw new BadRequestException('A data de partida deve estar no futuro.');
    }
  }

  private validateDistinctLocations(
    originAddress: string,
    destinationAddress: string,
  ) {
    if (
      originAddress.toLocaleLowerCase() ===
      destinationAddress.toLocaleLowerCase()
    ) {
      throw new BadRequestException('Origem e destino devem ser diferentes.');
    }
  }

  private validateCoordinatePair(
    latitude: number | undefined,
    longitude: number | undefined,
    location: string,
  ) {
    if ((latitude === undefined) !== (longitude === undefined)) {
      throw new BadRequestException(
        `Latitude e longitude de ${location} devem ser informadas juntas.`,
      );
    }
  }
}
