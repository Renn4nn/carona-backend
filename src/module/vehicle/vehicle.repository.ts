import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from 'generated/prisma/client';
import type {
  CreateVehicleSchema,
  UpdateVehicleSchema,
  VehicleQuerySchema,
} from 'src/utils/schemas/vehicle.schema';
import { VEHICLE_SELECT } from 'src/utils/selects';

@Injectable()
export class VehicleRepository {
  constructor(
    @Inject('PrismaService')
    private readonly prisma: PrismaClient,
  ) {}

  findManyByOwner(ownerId: string, query: VehicleQuerySchema) {
    return this.prisma.vehicle.findMany({
      where: {
        ownerId,
        active:
          query.active === undefined ? undefined : query.active === 'true',
      },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
      select: VEHICLE_SELECT,
    });
  }

  findByIdAndOwner(id: string, ownerId: string) {
    return this.prisma.vehicle.findFirst({
      where: { id, ownerId },
      select: VEHICLE_SELECT,
    });
  }

  findByPlate(plate: string) {
    return this.prisma.vehicle.findUnique({
      where: { plate },
      select: { id: true },
    });
  }

  create(ownerId: string, data: CreateVehicleSchema) {
    return this.prisma.vehicle.create({
      data: { ...data, ownerId },
      select: VEHICLE_SELECT,
    });
  }

  update(id: string, data: UpdateVehicleSchema) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
      select: VEHICLE_SELECT,
    });
  }

  setActive(id: string, active: boolean) {
    return this.prisma.vehicle.update({
      where: { id },
      data: { active },
      select: VEHICLE_SELECT,
    });
  }
}
