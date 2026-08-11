import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/module/user/user.service';
import type {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  VehicleQuerySchema,
  VehicleSchema,
} from 'src/utils/schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repository';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly userService: UserService,
  ) {}

  async findMine(
    userId: string,
    query: VehicleQuerySchema,
  ): Promise<VehicleSchema[]> {
    await this.userService.assertActive(userId);
    return this.vehicleRepository.findManyByOwner(userId, query);
  }

  async findById(userId: string, id: string): Promise<VehicleSchema> {
    await this.userService.assertActive(userId);
    return this.getOwned(userId, id);
  }

  async create(
    userId: string,
    data: CreateVehicleSchema,
  ): Promise<VehicleSchema> {
    await this.userService.assertActive(userId);
    const duplicate = await this.vehicleRepository.findByPlate(data.plate);
    if (duplicate) {
      throw new ConflictException('Esta placa já está cadastrada.');
    }
    return this.vehicleRepository.create(userId, data);
  }

  async update(
    userId: string,
    id: string,
    data: UpdateVehicleSchema,
  ): Promise<VehicleSchema> {
    await this.userService.assertActive(userId);
    await this.getOwned(userId, id);
    if (data.plate) {
      const duplicate = await this.vehicleRepository.findByPlate(data.plate);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Esta placa já está cadastrada.');
      }
    }
    return this.vehicleRepository.update(id, data);
  }

  async deactivate(userId: string, id: string): Promise<VehicleSchema> {
    await this.userService.assertActive(userId);
    await this.getOwned(userId, id);
    return this.vehicleRepository.setActive(id, false);
  }

  async activate(userId: string, id: string): Promise<VehicleSchema> {
    await this.userService.assertActive(userId);
    await this.getOwned(userId, id);
    return this.vehicleRepository.setActive(id, true);
  }

  private async getOwned(userId: string, id: string): Promise<VehicleSchema> {
    const vehicle = await this.vehicleRepository.findByIdAndOwner(id, userId);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }
    return vehicle;
  }
}
