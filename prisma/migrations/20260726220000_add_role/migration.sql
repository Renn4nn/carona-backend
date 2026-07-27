-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Seed the roles required by the authorization model
INSERT INTO "Role" ("id", "code", "name", "active", "createdAt", "updatedAt")
VALUES
    ('f49d47c2-3c4d-4d62-8c0f-9a5d10c5f001', 'USER', 'Usuário', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('f49d47c2-3c4d-4d62-8c0f-9a5d10c5f002', 'ADMIN', 'Administrador', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add roleId as nullable while existing users are migrated
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Preserve existing authorization when converting from the admin flag
UPDATE "User"
SET "roleId" = CASE
    WHEN "admin" = true
        THEN 'f49d47c2-3c4d-4d62-8c0f-9a5d10c5f002'
    ELSE 'f49d47c2-3c4d-4d62-8c0f-9a5d10c5f001'
END;

ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "admin";

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "Role"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
