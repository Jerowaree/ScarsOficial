/*
  Warnings:

  - You are about to drop the column `codigo` on the `servicios_catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_media` on the `servicios_catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `url_media` on the `servicios_catalogo` table. All the data in the column will be lost.
  - You are about to drop the `seguimiento_servicios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seguimientos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `seguimiento_servicios` DROP FOREIGN KEY `seguimiento_servicios_ibfk_1`;

-- DropForeignKey
ALTER TABLE `seguimiento_servicios` DROP FOREIGN KEY `seguimiento_servicios_ibfk_2`;

-- DropForeignKey
ALTER TABLE `seguimientos` DROP FOREIGN KEY `seguimientos_ibfk_1`;

-- DropForeignKey
ALTER TABLE `seguimientos` DROP FOREIGN KEY `seguimientos_ibfk_2`;

-- DropIndex
DROP INDEX `codigo` ON `servicios_catalogo`;

-- AlterTable
ALTER TABLE `servicios_catalogo` DROP COLUMN `codigo`,
    DROP COLUMN `tipo_media`,
    DROP COLUMN `url_media`,
    ADD COLUMN `precio` DECIMAL(10, 2) NULL;

-- DropTable
DROP TABLE `seguimiento_servicios`;

-- DropTable
DROP TABLE `seguimientos`;
