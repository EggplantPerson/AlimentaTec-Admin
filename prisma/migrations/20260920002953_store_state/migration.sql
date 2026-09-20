/*
  Warnings:

  - The primary key for the `StoreState` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `StoreState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StoreState" DROP CONSTRAINT "StoreState_pkey",
ADD COLUMN     "id" INTEGER NOT NULL,
ALTER COLUMN "isOpen" SET DEFAULT true,
ADD CONSTRAINT "StoreState_pkey" PRIMARY KEY ("id");
