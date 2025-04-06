/*
  Warnings:

  - Added the required column `content` to the `blocks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "props" JSONB,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
