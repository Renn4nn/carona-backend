import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/module/user/user.service';
import { createVehicleSchema } from 'src/utils/schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repository';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  const repository = {
    findByPlate: jest.fn(),
    findByIdAndOwner: jest.fn(),
    create: jest.fn(),
  };
  const userService = { assertActive: jest.fn() };
  const service = new VehicleService(
    repository as unknown as VehicleRepository,
    userService as unknown as UserService,
  );
  const data = {
    brand: 'Fiat',
    model: 'Uno',
    color: 'Prata',
    plate: 'ABC1D23',
    year: 2024,
    passengerCapacity: 4,
  };

  beforeEach(() => jest.clearAllMocks());

  it('normaliza placa antiga ou Mercosul', () => {
    const parsed = createVehicleSchema.parse({
      ...data,
      plate: 'abc-1d23',
    });
    expect(parsed.plate).toBe('ABC1D23');
  });

  it('valida limites de ano e capacidade', () => {
    expect(
      createVehicleSchema.safeParse({
        ...data,
        year: 1899,
        passengerCapacity: 21,
      }).success,
    ).toBe(false);
  });

  it('rejeita placa duplicada', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findByPlate.mockResolvedValue({ id: 'existing-id' });
    await expect(service.create('user-id', data)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('não expõe veículo pertencente a outro usuário', async () => {
    userService.assertActive.mockResolvedValue({});
    repository.findByIdAndOwner.mockResolvedValue(null);
    await expect(
      service.findById('user-id', 'vehicle-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
