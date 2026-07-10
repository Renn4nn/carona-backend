import type { PrismaClient } from "../../../generated/prisma/client"
import type { CustomPrismaService } from 'nestjs-prisma'

export type CustomPrismaClient = CustomPrismaService<PrismaClient>
