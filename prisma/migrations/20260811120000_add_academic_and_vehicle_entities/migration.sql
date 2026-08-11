-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "passengerCapacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_name_city_state_key" ON "University"("name", "city", "state");
CREATE INDEX "University_active_idx" ON "University"("active");
CREATE INDEX "University_state_city_idx" ON "University"("state", "city");
CREATE INDEX "University_name_idx" ON "University"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_universityId_name_key" ON "Course"("universityId", "name");
CREATE INDEX "Course_universityId_idx" ON "Course"("universityId");
CREATE INDEX "Course_active_idx" ON "Course"("active");
CREATE INDEX "Course_name_idx" ON "Course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
CREATE INDEX "StudentProfile_courseId_idx" ON "StudentProfile"("courseId");
CREATE INDEX "StudentProfile_active_idx" ON "StudentProfile"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");
CREATE INDEX "Vehicle_active_idx" ON "Vehicle"("active");

-- AddForeignKey
ALTER TABLE "Course"
ADD CONSTRAINT "Course_universityId_fkey"
FOREIGN KEY ("universityId") REFERENCES "University"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile"
ADD CONSTRAINT "StudentProfile_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
