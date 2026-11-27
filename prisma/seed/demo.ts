/**
 * Dados de demonstração (para gravar vídeos/apresentações sem expor dados reais).
 *
 * Cria/atualiza:
 *  - demo@carona.app            (motorista, "Marina Oliveira")
 *  - demo.passageiro@carona.app (passageiro, "Lucas Ferreira")
 *  - um veículo para a motorista
 *  - caronas ABERTAS nos próximos dias saindo de pontos públicos de Londrina
 *    para UEL, Universidade Positivo e UTFPR.
 *
 * Pode ser rodado várias vezes: as caronas da conta demo (e os pedidos de vaga
 * nelas) são apagadas e recriadas com datas futuras a cada execução.
 *
 * Uso (com o Docker rodando):
 *   docker compose exec backend pnpm db:seed:demo
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import * as bcrypt from 'bcrypt';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT = '5432',
  POSTGRES_DB,
  DEMO_PASSWORD = 'Demo@2026',
} = process.env;

const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }, { schema: 'public' }),
});

const DEMO_DRIVER = {
  login: 'demo@carona.app',
  name: 'Marina Oliveira',
  registration: '20269001',
};
const DEMO_PASSENGER = {
  login: 'demo.passageiro@carona.app',
  name: 'Lucas Ferreira',
  registration: '20269002',
};
const DEMO_VEHICLE = {
  brand: 'Chevrolet',
  model: 'Onix',
  color: 'Cinza',
  plate: 'DMO2A26',
  year: 2023,
  passengerCapacity: 4,
};

type Place = { address: string; latitude: number; longitude: number };

const PLACES = {
  terminal: {
    address: 'Terminal Urbano de Londrina, Centro, Londrina - PR',
    latitude: -23.3083929,
    longitude: -51.1611273,
  },
  catuai: {
    address: 'Shopping Catuaí, Rodovia Celso Garcia Cid 5600, Londrina - PR',
    latitude: -23.3419799,
    longitude: -51.1854557,
  },
  igapo: {
    address: 'Aterro do Lago Igapó, Gleba Palhano, Londrina - PR',
    latitude: -23.3235859,
    longitude: -51.1794953,
  },
  uel: {
    address:
      'Universidade Estadual de Londrina (UEL), Rodovia Celso Garcia Cid, Londrina - PR',
    latitude: -23.3249735,
    longitude: -51.201804,
  },
  positivo: {
    address:
      'Universidade Positivo, Rua João Rogério Ribeiro Bonesi 150, Londrina - PR',
    latitude: -23.3472567,
    longitude: -51.1768335,
  },
  utfpr: {
    address: 'UTFPR Londrina, Avenida João Miguel Caram 3131, Londrina - PR',
    latitude: -23.3072816,
    longitude: -51.1142573,
  },
} satisfies Record<string, Place>;

// [origem, destino, dias a partir de hoje, horário em Londrina, observação]
const RIDES: [Place, Place, number, string, string][] = [
  [
    PLACES.terminal,
    PLACES.uel,
    1,
    '07:00',
    'Saída pontual. Passo pela Av. Higienópolis.',
  ],
  [PLACES.catuai, PLACES.uel, 1, '07:20', 'Espero até 5 minutos no ponto.'],
  [PLACES.igapo, PLACES.positivo, 1, '07:30', 'Ar-condicionado, sem fumar.'],
  [PLACES.terminal, PLACES.utfpr, 1, '18:00', 'Aula noturna, volto às 22h30.'],
  [PLACES.uel, PLACES.terminal, 1, '18:10', 'Volta depois da aula da tarde.'],
  [PLACES.catuai, PLACES.positivo, 2, '13:00', 'Ida para a aula da tarde.'],
  [
    PLACES.igapo,
    PLACES.utfpr,
    2,
    '07:10',
    'Cabe uma mochila grande no porta-malas.',
  ],
];

/** Data em Londrina (UTC-3, sem horário de verão desde 2019). */
function departureAt(daysFromToday: number, time: string) {
  const nowInLondrina = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const day = new Date(nowInLondrina);
  day.setUTCDate(day.getUTCDate() + daysFromToday);
  const date = day.toISOString().slice(0, 10);
  return new Date(`${date}T${time}:00-03:00`);
}

async function upsertStudent(
  person: { login: string; name: string; registration: string },
  password: string,
  courseId: string,
) {
  const user = await prisma.user.upsert({
    where: { login: person.login },
    update: { password, active: true },
    create: {
      login: person.login,
      password,
      active: true,
      role: { connect: { code: 'USER' } },
    },
  });
  await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      name: person.name,
      courseId,
      registration: person.registration,
      active: true,
    },
    create: {
      userId: user.id,
      courseId,
      name: person.name,
      registration: person.registration,
      active: true,
    },
  });
  return user;
}

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, await bcrypt.genSalt());

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
  const course = await prisma.course.upsert({
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

  const driver = await upsertStudent(DEMO_DRIVER, password, course.id);
  await upsertStudent(DEMO_PASSENGER, password, course.id);

  const vehicle = await prisma.vehicle.upsert({
    where: { plate: DEMO_VEHICLE.plate },
    update: { ...DEMO_VEHICLE, ownerId: driver.id, active: true },
    create: { ...DEMO_VEHICLE, ownerId: driver.id, active: true },
  });

  const openStatus = await prisma.rideStatus.findUniqueOrThrow({
    where: { code: 'OPEN' },
  });

  const rides = await prisma.$transaction(async (tx) => {
    const old = await tx.ride.findMany({
      where: { driverId: driver.id },
      select: { id: true },
    });
    const oldIds = old.map((ride) => ride.id);
    await tx.rideParticipant.deleteMany({ where: { rideId: { in: oldIds } } });
    await tx.ride.deleteMany({ where: { id: { in: oldIds } } });

    return Promise.all(
      RIDES.map(([origin, destination, days, time, notes]) =>
        tx.ride.create({
          data: {
            driverId: driver.id,
            vehicleId: vehicle.id,
            statusId: openStatus.id,
            originAddress: origin.address,
            originLatitude: origin.latitude,
            originLongitude: origin.longitude,
            destinationAddress: destination.address,
            destinationLatitude: destination.latitude,
            destinationLongitude: destination.longitude,
            departureAt: departureAt(days, time),
            totalSeats: vehicle.passengerCapacity,
            availableSeats: vehicle.passengerCapacity,
            notes,
          },
        }),
      ),
    );
  });

  console.log('Dados de demonstração prontos!\n');
  console.log(
    `Motorista:  ${DEMO_DRIVER.login} / ${DEMO_PASSWORD} (${DEMO_DRIVER.name})`,
  );
  console.log(
    `Passageiro: ${DEMO_PASSENGER.login} / ${DEMO_PASSWORD} (${DEMO_PASSENGER.name})`,
  );
  console.log(`Veículo:    ${vehicle.brand} ${vehicle.model} ${vehicle.plate}`);
  console.log(`Caronas:    ${rides.length} abertas nos próximos 2 dias`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
