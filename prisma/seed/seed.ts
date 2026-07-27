import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { seedDatabase } from '../../src/utils/extensions/utilsDb'
import * as bcrypt from 'bcrypt'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT = '5432', POSTGRES_DB } = process.env;
const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

const schema = 'public'
const adapter = new PrismaPg({ connectionString }, { schema })
const prisma = new PrismaClient({ adapter })

async function main() {
  const userLogin = process.env.USER_LOGIN || 'user.carona';
  const userPassword = process.env.USER_PASSWORD || 'user.carona';
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(userPassword, salt);
  await seedDatabase({
    prisma,
    operations: [
      prisma.user.upsert({
        where: {
          login: userLogin,
        },
        update: {},
        create: {
            login: userLogin,
            password: hashedPassword,
            active: true,
            role: {
              connect: {
                code: 'USER',
              },
            },
        },
      }),
    ],
  })

  console.log('Seed completed with information:')
  console.log('  - User login:', userLogin)
  console.log('  - User password:', userPassword)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
