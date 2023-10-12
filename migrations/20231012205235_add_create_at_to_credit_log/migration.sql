/*
  Warnings:

  - The primary key for the `CreditLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_Followers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_Followers` DROP FOREIGN KEY `_Followers_A_fkey`;

-- DropForeignKey
ALTER TABLE `_Followers` DROP FOREIGN KEY `_Followers_B_fkey`;

-- AlterTable
ALTER TABLE `CreditLog` DROP PRIMARY KEY,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `_Followers`;

-- CreateTable
CREATE TABLE `_followers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_followers_AB_unique`(`A`, `B`),
    INDEX `_followers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_followers` ADD CONSTRAINT `_followers_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_followers` ADD CONSTRAINT `_followers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
