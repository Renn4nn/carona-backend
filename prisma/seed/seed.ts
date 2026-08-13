import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { seedDatabase } from '../../src/utils/extensions/utilsDb';
import * as bcrypt from 'bcrypt';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT = '5432',
  POSTGRES_DB,
} = process.env;

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

const schema = 'public';

const adapter = new PrismaPg({ connectionString }, { schema });
const prisma = new PrismaClient({ adapter });

async function main() {
  const userLogin = process.env.USER_LOGIN || 'user.carona';
  const userPassword = process.env.USER_PASSWORD || 'user.carona';
  const studentName = process.env.STUDENT_NAME || 'Usuario Carona';

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
  });

  const user = await prisma.user.findUnique({
    where: {
      login: userLogin,
    },
  });

  if (!user) {
    throw new Error(`Usuário ${userLogin} não encontrado.`);
  }

  const university = await prisma.university.upsert({
    where: {
      name_city_state: {
        name: 'Universidade Estadual de Londrina',
        city: 'Londrina',
        state: 'PR',
      },
    },
    update: {},
    create: {
      name: 'Universidade Estadual de Londrina',
      city: 'Londrina',
      state: 'PR',
      active: true,
    },
  });

  const computerScienceCourse = await prisma.course.upsert({
    where: {
      universityId_name: {
        universityId: university.id,
        name: 'Ciência da Computação',
      },
    },
    update: {},
    create: {
      universityId: university.id,
      name: 'Ciência da Computação',
      active: true,
    },
  });

  const softwareEngineeringCourse = await prisma.course.upsert({
    where: {
      universityId_name: {
        universityId: university.id,
        name: 'Engenharia de Software',
      },
    },
    update: {},
    create: {
      universityId: university.id,
      name: 'Engenharia de Software',
      active: true,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      userId: user.id,
    },
    update: {
      name: studentName,
      courseId: computerScienceCourse.id,
      registration: '20260001',
      active: true,
    },
    create: {
      userId: user.id,
      courseId: computerScienceCourse.id,
      name: studentName,
      registration: '20260001',
      active: true,
    },
  });

  console.log('Seed completed successfully!');
  console.log('');
  console.log('User:');
  console.log('  - Login:', userLogin);
  console.log('  - Password:', userPassword);
  console.log('');
  console.log('University:');
  console.log('  - Name:', university.name);
  console.log('  - City:', university.city);
  console.log('  - State:', university.state);
  console.log('');
  console.log('Courses:');
  console.log('  -', computerScienceCourse.name);
  console.log('  -', softwareEngineeringCourse.name);
  console.log('');
  console.log('Student profile:');
  console.log('  - Name:', studentProfile.name);
  console.log('  - Registration:', studentProfile.registration);
  console.log('  - Course:', computerScienceCourse.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
