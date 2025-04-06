/*
  Warnings:

  - You are about to drop the column `content` on the `notes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notes" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
