-- Simplify ride publication while preserving existing free-form information.
ALTER TABLE "Ride" ADD COLUMN "notes" TEXT;

UPDATE "Ride"
SET "notes" = NULLIF(
  CONCAT_WS(
    E'\n\n',
    CASE WHEN NULLIF(BTRIM("description"), '') IS NOT NULL
      THEN 'Descrição: ' || BTRIM("description") END,
    CASE WHEN NULLIF(BTRIM("rules"), '') IS NOT NULL
      THEN 'Regras: ' || BTRIM("rules") END,
    CASE WHEN NULLIF(BTRIM("paymentNotes"), '') IS NOT NULL
      THEN 'Observações de pagamento: ' || BTRIM("paymentNotes") END
  ),
  ''
);

ALTER TABLE "RideParticipant"
  ADD COLUMN "dropoffAddress" TEXT,
  ADD COLUMN "dropoffLatitude" DECIMAL(10,7),
  ADD COLUMN "dropoffLongitude" DECIMAL(10,7),
  ADD COLUMN "distanceMeters" INTEGER,
  ADD COLUMN "rideAmount" DECIMAL(10,2),
  ADD COLUMN "platformFee" DECIMAL(10,2),
  ADD COLUMN "totalAmount" DECIMAL(10,2),
  ADD COLUMN "priceCalculatedAt" TIMESTAMPTZ(3);

ALTER TABLE "Ride" DROP CONSTRAINT "Ride_payment_method_check";
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_contribution_check";
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_paymentMethodId_fkey";
DROP INDEX "Ride_paymentMethodId_idx";

ALTER TABLE "Ride"
  DROP COLUMN "originName",
  DROP COLUMN "destinationName",
  DROP COLUMN "paymentMethodId",
  DROP COLUMN "contributionPerSeat",
  DROP COLUMN "paymentNotes",
  DROP COLUMN "description",
  DROP COLUMN "rules";

ALTER TABLE "RideParticipant"
ADD CONSTRAINT "RideParticipant_dropoff_coordinates_check"
CHECK (
  ("dropoffLatitude" IS NULL AND "dropoffLongitude" IS NULL)
  OR (
    "dropoffLatitude" BETWEEN -90 AND 90
    AND "dropoffLongitude" BETWEEN -180 AND 180
  )
);

ALTER TABLE "RideParticipant"
ADD CONSTRAINT "RideParticipant_pricing_check"
CHECK (
  ("distanceMeters" IS NULL OR "distanceMeters" >= 0)
  AND ("rideAmount" IS NULL OR "rideAmount" >= 0)
  AND ("platformFee" IS NULL OR "platformFee" >= 0)
  AND ("totalAmount" IS NULL OR "totalAmount" >= 0)
);
