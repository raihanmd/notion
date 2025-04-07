-- CreateEnum
CREATE TYPE "SharePolicy" AS ENUM ('SHARE_WITH_LINK', 'PRIVATE', 'TEAM');

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "share_policy" "SharePolicy" NOT NULL DEFAULT 'PRIVATE';
