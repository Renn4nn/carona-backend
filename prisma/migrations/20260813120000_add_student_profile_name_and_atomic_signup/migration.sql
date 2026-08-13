-- Add the new column as nullable so existing profiles can be migrated safely.
ALTER TABLE "StudentProfile"
ADD COLUMN "name" TEXT;

-- Use the current login as a temporary display name for existing profiles.
UPDATE "StudentProfile" AS profile
SET "name" = COALESCE(
  NULLIF(
    INITCAP(
      REGEXP_REPLACE(
        SPLIT_PART("User"."login", '@', 1),
        '[._-]+',
        ' ',
        'g'
      )
    ),
    ''
  ),
  'Estudante'
)
FROM "User"
WHERE "User"."id" = profile."userId";

UPDATE "StudentProfile"
SET "name" = 'Estudante'
WHERE "name" IS NULL OR BTRIM("name") = '';

ALTER TABLE "StudentProfile"
ALTER COLUMN "name" SET NOT NULL;
