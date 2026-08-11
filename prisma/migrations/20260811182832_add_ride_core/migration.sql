-- CreateTable
CREATE TABLE "RideStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "originName" TEXT NOT NULL,
    "originAddress" TEXT NOT NULL,
    "originLatitude" DECIMAL(10,7),
    "originLongitude" DECIMAL(10,7),
    "destinationName" TEXT NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "destinationLatitude" DECIMAL(10,7),
    "destinationLongitude" DECIMAL(10,7),
    "departureAt" TIMESTAMPTZ(3) NOT NULL,
    "estimatedArrivalAt" TIMESTAMPTZ(3),
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "contributionPerSeat" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentNotes" TEXT,
    "description" TEXT,
    "rules" TEXT,
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "canceledAt" TIMESTAMPTZ(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideParticipant" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "message" TEXT,
    "requestedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMPTZ(3),
    "canceledAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideParticipant_pkey" PRIMARY KEY ("id")
);

-- Seed immutable domain catalog codes
INSERT INTO "RideStatus" ("id", "code", "name", "description", "active", "displayOrder", "createdAt", "updatedAt")
VALUES
    ('7cbddfa0-f7e8-450c-8714-b6e3cb332001', 'OPEN', 'Aberta', 'Carona disponível para solicitações.', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('7cbddfa0-f7e8-450c-8714-b6e3cb332002', 'IN_PROGRESS', 'Em andamento', 'Carona iniciada pelo motorista.', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('7cbddfa0-f7e8-450c-8714-b6e3cb332003', 'COMPLETED', 'Concluída', 'Carona finalizada.', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('7cbddfa0-f7e8-450c-8714-b6e3cb332004', 'CANCELED', 'Cancelada', 'Carona cancelada pelo motorista.', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "ParticipantStatus" ("id", "code", "name", "description", "active", "displayOrder", "createdAt", "updatedAt")
VALUES
    ('0219d548-c5eb-44fc-899e-1fe3bf389001', 'PENDING', 'Pendente', 'Solicitação aguardando resposta do motorista.', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('0219d548-c5eb-44fc-899e-1fe3bf389002', 'ACCEPTED', 'Aceita', 'Solicitação aceita pelo motorista.', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('0219d548-c5eb-44fc-899e-1fe3bf389003', 'REJECTED', 'Recusada', 'Solicitação recusada pelo motorista.', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('0219d548-c5eb-44fc-899e-1fe3bf389004', 'CANCELED', 'Cancelada', 'Participação cancelada.', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('0219d548-c5eb-44fc-899e-1fe3bf389005', 'COMPLETED', 'Concluída', 'Participação concluída com a carona.', true, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "PaymentMethod" ("id", "code", "name", "description", "active", "displayOrder", "createdAt", "updatedAt")
VALUES
    ('c40da093-f764-45be-8650-bd93e59be001', 'CASH', 'Dinheiro', 'Pagamento combinado diretamente em dinheiro.', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c40da093-f764-45be-8650-bd93e59be002', 'PIX', 'PIX', 'Transferência PIX combinada diretamente entre os usuários.', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c40da093-f764-45be-8650-bd93e59be003', 'BANK_TRANSFER', 'Transferência bancária', 'Transferência combinada diretamente entre os usuários.', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('c40da093-f764-45be-8650-bd93e59be004', 'OTHER', 'Outro', 'Outro método combinado fora da plataforma.', true, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Domain constraints not represented by Prisma schema
ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_seats_check"
CHECK ("totalSeats" > 0 AND "availableSeats" >= 0 AND "availableSeats" <= "totalSeats");

ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_contribution_check"
CHECK ("contributionPerSeat" >= 0);

ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_payment_method_check"
CHECK ("contributionPerSeat" = 0 OR "paymentMethodId" IS NOT NULL);

ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_origin_coordinates_check"
CHECK (
    ("originLatitude" IS NULL AND "originLongitude" IS NULL)
    OR (
        "originLatitude" BETWEEN -90 AND 90
        AND "originLongitude" BETWEEN -180 AND 180
    )
);

ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_destination_coordinates_check"
CHECK (
    ("destinationLatitude" IS NULL AND "destinationLongitude" IS NULL)
    OR (
        "destinationLatitude" BETWEEN -90 AND 90
        AND "destinationLongitude" BETWEEN -180 AND 180
    )
);

ALTER TABLE "Ride"
ADD CONSTRAINT "Ride_estimated_arrival_check"
CHECK ("estimatedArrivalAt" IS NULL OR "estimatedArrivalAt" > "departureAt");

-- CreateIndex
CREATE UNIQUE INDEX "RideStatus_code_key" ON "RideStatus"("code");

-- CreateIndex
CREATE INDEX "RideStatus_active_displayOrder_idx" ON "RideStatus"("active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantStatus_code_key" ON "ParticipantStatus"("code");

-- CreateIndex
CREATE INDEX "ParticipantStatus_active_displayOrder_idx" ON "ParticipantStatus"("active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_active_displayOrder_idx" ON "PaymentMethod"("active", "displayOrder");

-- CreateIndex
CREATE INDEX "Ride_statusId_departureAt_idx" ON "Ride"("statusId", "departureAt");

-- CreateIndex
CREATE INDEX "Ride_driverId_departureAt_idx" ON "Ride"("driverId", "departureAt");

-- CreateIndex
CREATE INDEX "Ride_vehicleId_departureAt_idx" ON "Ride"("vehicleId", "departureAt");

-- CreateIndex
CREATE INDEX "Ride_paymentMethodId_idx" ON "Ride"("paymentMethodId");

-- CreateIndex
CREATE INDEX "RideParticipant_rideId_statusId_idx" ON "RideParticipant"("rideId", "statusId");

-- CreateIndex
CREATE INDEX "RideParticipant_userId_statusId_idx" ON "RideParticipant"("userId", "statusId");

-- CreateIndex
CREATE INDEX "RideParticipant_statusId_idx" ON "RideParticipant"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "RideParticipant_rideId_userId_key" ON "RideParticipant"("rideId", "userId");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "RideStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideParticipant" ADD CONSTRAINT "RideParticipant_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideParticipant" ADD CONSTRAINT "RideParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideParticipant" ADD CONSTRAINT "RideParticipant_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ParticipantStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
