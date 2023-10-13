/*
  Warnings:

  - The primary key for the `CreditLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `endAddr` on the `CreditLog` table. All the data in the column will be lost.
  - You are about to drop the column `startAddr` on the `CreditLog` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `CreditLog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `userId` on the `CreditLog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `A` on the `_followers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.
  - You are about to alter the column `B` on the `_followers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Char(36)`.

*/
-- DropForeignKey
ALTER TABLE `CreditLog` DROP FOREIGN KEY `CreditLog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_followers` DROP FOREIGN KEY `_followers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_followers` DROP FOREIGN KEY `_followers_B_fkey`;

-- AlterTable
ALTER TABLE `CreditLog` DROP PRIMARY KEY,
    DROP COLUMN `endAddr`,
    DROP COLUMN `startAddr`,
    MODIFY `id` CHAR(36) NOT NULL,
    MODIFY `userId` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` CHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `_followers` MODIFY `A` CHAR(36) NOT NULL,
    MODIFY `B` CHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `CreditLog` ADD CONSTRAINT `CreditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_followers` ADD CONSTRAINT `_followers_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_followers` ADD CONSTRAINT `_followers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
