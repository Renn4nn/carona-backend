import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ParticipantStatusService } from 'src/module/participant-status/participant-status.service';
import { RideService } from 'src/module/ride/ride.service';
import { UserService } from 'src/module/user/user.service';
import { RideParticipantRepository } from './ride-participant.repository';
import { RideParticipantService } from './ride-participant.service';

describe('RideParticipantService', () => {
  const repository = {
    findByRideAndUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    accept: jest.fn(),
  };
  const rideService = { getExistingForParticipant: jest.fn() };
  const userService = { assertActive: jest.fn() };
  const statusService = { getActiveByCode: jest.fn() };
  const service = new RideParticipantService(
    repository as unknown as RideParticipantRepository,
    rideService as unknown as RideService,
    userService as unknown as UserService,
    statusService as unknown as ParticipantStatusService,
  );
  const openRide = {
    id: 'ride-id',
    driverId: 'driver-id',
    status: { code: 'OPEN' },
    departureAt: new Date(Date.now() + 3_600_000),
    availableSeats: 1,
  };

  beforeEach(() => jest.clearAllMocks());

  it('impede motorista de solicitar a própria carona', async () => {
    userService.assertActive.mockResolvedValue({});
    rideService.getExistingForParticipant.mockResolvedValue(openRide);
    await expect(
      service.request('driver-id', 'ride-id', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('impede segunda solicitação para a mesma carona', async () => {
    userService.assertActive.mockResolvedValue({});
    rideService.getExistingForParticipant.mockResolvedValue(openRide);
    repository.findByRideAndUser.mockResolvedValue({ id: 'existing-id' });
    await expect(
      service.request('passenger-id', 'ride-id', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('somente motorista pode aceitar passageiros', async () => {
    userService.assertActive.mockResolvedValue({});
    rideService.getExistingForParticipant.mockResolvedValue(openRide);
    await expect(
      service.accept('other-user', 'ride-id', 'participant-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('reporta conflito atômico ao disputar a última vaga', async () => {
    userService.assertActive.mockResolvedValue({});
    rideService.getExistingForParticipant.mockResolvedValue(openRide);
    repository.findById.mockResolvedValue({
      id: 'participant-id',
      rideId: 'ride-id',
      status: { code: 'PENDING' },
    });
    statusService.getActiveByCode.mockResolvedValue({ id: 'accepted-id' });
    repository.accept.mockResolvedValue(null);
    await expect(
      service.accept('driver-id', 'ride-id', 'participant-id'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('não permite cancelar vaga aceita após o início', async () => {
    userService.assertActive.mockResolvedValue({});
    rideService.getExistingForParticipant.mockResolvedValue({
      ...openRide,
      status: { code: 'IN_PROGRESS' },
    });
    repository.findByRideAndUser.mockResolvedValue({
      status: { code: 'ACCEPTED' },
    });
    statusService.getActiveByCode.mockResolvedValue({ id: 'canceled-id' });
    await expect(
      service.cancelMine('passenger-id', 'ride-id', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
