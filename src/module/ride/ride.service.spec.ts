import { ConflictException, NotFoundException } from '@nestjs/common';
import { ParticipantStatusService } from 'src/module/participant-status/participant-status.service';
import { RideStatusService } from 'src/module/ride-status/ride-status.service';
import { UserService } from 'src/module/user/user.service';
import { VehicleService } from 'src/module/vehicle/vehicle.service';
import { createRideSchema } from 'src/utils/schemas/ride.schema';
import { mapPublicRide } from './ride.mapper';
import { RideRepository } from './ride.repository';
import { RideService } from './ride.service';

describe('RideService', () => {
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    findParticipantStatus: jest.fn(),
    countAccepted: jest.fn(),
    update: jest.fn(),
  };
  const userService = { assertActive: jest.fn() };
  const vehicleService = { getActiveOwned: jest.fn() };
  const rideStatusService = { getActiveByCode: jest.fn() };
  const participantStatusService = { getActiveByCode: jest.fn() };
  const service = new RideService(
    repository as unknown as RideRepository,
    userService as unknown as UserService,
    vehicleService as unknown as VehicleService,
    rideStatusService as unknown as RideStatusService,
    participantStatusService as unknown as ParticipantStatusService,
  );
  const baseInput = {
    vehicleId: '85f45fb4-3bf9-4a53-a685-5eb63572d61e',
    originAddress: 'Rua da Origem, 100',
    destinationAddress: 'Avenida do Campus, 200',
    departureAt: new Date(Date.now() + 3_600_000).toISOString(),
    notes: 'Saída pontual.',
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejeita coordenadas incompletas', () => {
    expect(
      createRideSchema.safeParse({
        ...baseInput,
        originLatitude: -23.5,
      }).success,
    ).toBe(false);
  });

  it('usa a capacidade do veículo como snapshot de vagas', async () => {
    userService.assertActive.mockResolvedValue({});
    vehicleService.getActiveOwned.mockResolvedValue({ passengerCapacity: 3 });
    rideStatusService.getActiveByCode.mockResolvedValue({ id: 'status-id' });
    repository.create.mockResolvedValue({
      id: 'ride-id',
      driverId: 'driver-id',
      vehicleId: baseInput.vehicleId,
      status: {
        id: 'status-id',
        code: 'OPEN',
        name: 'Aberta',
        description: null,
        active: true,
        displayOrder: 10,
      },
      driver: { id: 'driver-id', login: 'motorista' },
      vehicle: {
        id: baseInput.vehicleId,
        ownerId: 'driver-id',
        brand: 'Honda',
        model: 'Civic',
        color: 'Prata',
        year: 2024,
        passengerCapacity: 3,
        active: true,
      },
      originAddress: baseInput.originAddress,
      originLatitude: null,
      originLongitude: null,
      destinationAddress: baseInput.destinationAddress,
      destinationLatitude: null,
      destinationLongitude: null,
      departureAt: new Date(baseInput.departureAt),
      estimatedArrivalAt: null,
      totalSeats: 3,
      availableSeats: 3,
      notes: baseInput.notes,
      startedAt: null,
      completedAt: null,
      canceledAt: null,
      cancellationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await service.create('driver-id', baseInput);
    expect(repository.create).toHaveBeenCalledWith(
      'driver-id',
      'status-id',
      3,
      baseInput,
    );
  });

  it('propaga veículo alheio ou inexistente', async () => {
    userService.assertActive.mockResolvedValue({});
    vehicleService.getActiveOwned.mockRejectedValue(new NotFoundException());
    await expect(service.create('driver-id', baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('bloqueia alteração estrutural após aceite', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      status: { code: 'OPEN' },
    });
    repository.countAccepted.mockResolvedValue(1);
    await expect(
      service.update('driver-id', 'ride-id', {
        destinationAddress: 'Outro destino, 300',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('recalcula o snapshot ao trocar o veículo antes de aceitar passageiros', async () => {
    const repositoryStop = new Error('stop-after-update');
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      vehicleId: baseInput.vehicleId,
      status: { code: 'OPEN' },
      originAddress: baseInput.originAddress,
      destinationAddress: baseInput.destinationAddress,
      departureAt: new Date(baseInput.departureAt),
      originLatitude: null,
      originLongitude: null,
      destinationLatitude: null,
      destinationLongitude: null,
    });
    repository.countAccepted.mockResolvedValue(0);
    vehicleService.getActiveOwned.mockResolvedValue({ passengerCapacity: 2 });
    repository.update.mockRejectedValue(repositoryStop);

    await expect(
      service.update('driver-id', 'ride-id', {
        vehicleId: 'a9cf92e9-3fc1-4bf5-b942-270104259b88',
      }),
    ).rejects.toBe(repositoryStop);
    expect(repository.update).toHaveBeenCalledWith(
      'ride-id',
      expect.objectContaining({ totalSeats: 2, availableSeats: 2 }),
    );
  });

  it('mantém o snapshot ao alterar somente observações', async () => {
    const repositoryStop = new Error('stop-after-update');
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      vehicleId: baseInput.vehicleId,
      status: { code: 'OPEN' },
      originAddress: baseInput.originAddress,
      destinationAddress: baseInput.destinationAddress,
      departureAt: new Date(baseInput.departureAt),
      originLatitude: null,
      originLongitude: null,
      destinationLatitude: null,
      destinationLongitude: null,
    });
    repository.countAccepted.mockResolvedValue(1);
    repository.update.mockRejectedValue(repositoryStop);

    await expect(
      service.update('driver-id', 'ride-id', { notes: 'Nova observação' }),
    ).rejects.toBe(repositoryStop);
    expect(repository.update).toHaveBeenCalledWith('ride-id', {
      notes: 'Nova observação',
    });
  });

  it('rejeita início fora do estado OPEN', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      status: { code: 'COMPLETED' },
    });
    await expect(service.start('driver-id', 'ride-id')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejeita conclusão fora do estado IN_PROGRESS', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      status: { code: 'OPEN' },
    });
    await expect(
      service.complete('driver-id', 'ride-id'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejeita cancelamento de carona terminal', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findById.mockResolvedValue({
      driverId: 'driver-id',
      status: { code: 'COMPLETED' },
    });
    await expect(
      service.cancel('driver-id', 'ride-id', { reason: 'Teste' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('mapper público expõe o trajeto sem motorista ou veículo', () => {
    const mapped = mapPublicRide({
      id: 'ride-id',
      status: {
        id: 'status-id',
        code: 'OPEN',
        name: 'Aberta',
        description: null,
        active: true,
        displayOrder: 10,
      },
      originAddress: 'Rua da Origem, 100',
      destinationAddress: 'Avenida do Campus, 200',
      departureAt: new Date(),
      estimatedArrivalAt: null,
      totalSeats: 4,
      availableSeats: 0,
    });
    expect(mapped.isFull).toBe(true);
    expect(mapped.originAddress).toBe('Rua da Origem, 100');
    expect(mapped).not.toHaveProperty('driver');
    expect(mapped).not.toHaveProperty('vehicle');
  });
});
