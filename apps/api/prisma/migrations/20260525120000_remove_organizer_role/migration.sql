-- Reassign legacy ORGANIZER accounts before shrinking the enum
UPDATE "users" SET "role" = 'USER' WHERE "role"::text = 'ORGANIZER';

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

DROP TYPE "UserRole_old";
