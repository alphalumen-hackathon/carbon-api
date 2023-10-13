/*
  Warnings:

  - You are about to drop the column `endLat` on the `CreditLog` table. All the data in the column will be lost.
  - You are about to drop the column `endLng` on the `CreditLog` table. All the data in the column will be lost.
  - You are about to drop the column `startLat` on the `CreditLog` table. All the data in the column will be lost.
  - You are about to drop the column `startLng` on the `CreditLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CreditLog` DROP COLUMN `endLat`,
    DROP COLUMN `endLng`,
    DROP COLUMN `startLat`,
    DROP COLUMN `startLng`;
