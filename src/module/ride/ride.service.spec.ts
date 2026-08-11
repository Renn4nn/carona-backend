import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ParticipantStatusService } from 'src/module/participant-status/participant-status.service';
import { PaymentMethodService } from 'src/module/payment-method/payment-method.service';
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
    countAccepted: jest.fn(),
    update: jest.fn(),
  };
  const userService = { assertActive: jest.fn() };
  const vehicleService = { getActiveOwned: jest.fn() };
  const rideStatusService = { getActiveByCode: jest.fn() };
  const participantStatusService = { getActiveByCode: jest.fn() };
  const paymentMethodService = { getActiveById: jest.fn() };
  const service = new RideService(
    repository as unknown as RideRepository,
    userService as unknown as UserService,
    vehicleService as unknown as VehicleService,
    rideStatusService as unknown as RideStatusService,
    participantStatusService as unknown as ParticipantStatusService,
    paymentMethodService as unknown as PaymentMethodService,
  );
  const baseInput = {
    vehicleId: '85f45fb4-3bf9-4a53-a685-5eb63572d61e',
    originName: 'Centro',
    originAddress: 'Rua da Origem, 100',
    destinationName: 'Campus',
    destinationAddress: 'Avenida do Campus, 200',
    departureAt: new Date(Date.now() + 3_600_000).toISOString(),
    totalSeats: 4,
    contributionPerSeat: 0,
  };

  beforeEach(() => jest.clearAllMocks());

  it('rejeita contribuição positiva sem método', () => {
    expect(
      createRideSchema.safeParse({
        ...baseInput,
        contributionPerSeat: 10,
      }).success,
    ).toBe(false);
  });

  it('rejeita coordenadas incompletas e chegada anterior', () => {
    expect(
      createRideSchema.safeParse({
        ...baseInput,
        originLatitude: -23.5,
        estimatedArrivalAt: new Date(Date.now() + 1_000).toISOString(),
      }).success,
    ).toBe(false);
  });

  it('rejeita vagas acima da capacidade do veículo', async () => {
    userService.assertActive.mockResolvedValue({});
    vehicleService.getActiveOwned.mockResolvedValue({ passengerCapacity: 3 });
    await expect(service.create('driver-id', baseInput)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.create).not.toHaveBeenCalled();
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
      service.update('driver-id', 'ride-id', { totalSeats: 2 }),
    ).rejects.toBeInstanceOf(ConflictException);
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

  it('mapper público não expõe endereço, motorista ou veículo', () => {
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
      originName: 'Centro',
      destinationName: 'Campus',
      departureAt: new Date(),
      estimatedArrivalAt: null,
      totalSeats: 4,
      availableSeats: 0,
      contributionPerSeat: { toFixed: () => '0.00' },
      paymentMethod: null,
    } as never);
    expect(mapped.isFull).toBe(true);
    expect(mapped).not.toHaveProperty('originAddress');
    expect(mapped).not.toHaveProperty('driver');
    expect(mapped).not.toHaveProperty('vehicle');
  });
});
