-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "addons" TEXT[] DEFAULT ARRAY[]::TEXT[];
