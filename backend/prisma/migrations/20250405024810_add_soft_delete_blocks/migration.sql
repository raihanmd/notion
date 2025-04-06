-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "deleted_at" TIMESTAMP(6),
ADD COLUMN     "parent_id" VARCHAR(255),
ALTER COLUMN "version" SET DEFAULT 1;
