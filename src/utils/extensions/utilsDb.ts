import type { Prisma, PrismaClient } from '../../../generated/prisma/client';

type SeedDatabaseParams = {
  prisma: PrismaClient;
  operations: Prisma.PrismaPromise<unknown>[];
  log?: boolean;
};

export async function seedDatabase({
  prisma,
  operations,
  log = true,
}: SeedDatabaseParams): Promise<void> {
  try {
    const result = await prisma.$transaction(operations);

    if (log) {
      console.info(
        `✅ Database seeded successfully! ${result.length} records processed.`,
      );
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
