/*
  Warnings:

  - You are about to drop the column `cliente_nombre` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `id_cliente` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `servicio_solicitado` on the `solicitudes` table. All the data in the column will be lost.
  - Made the column `precio` on table `servicios_catalogo` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `correo` to the `solicitudes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `solicitudes` table without a default value. This is not possible if the table is not empty.
  - Made the column `numero` on table `solicitudes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creado_en` on table `solicitudes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `solicitudes` DROP FOREIGN KEY `solicitudes_ibfk_1`;

-- DropIndex
DROP INDEX `codigo` ON `solicitudes`;

-- DropIndex
DROP INDEX `id_cliente` ON `solicitudes`;

-- AlterTable
ALTER TABLE `servicios_catalogo` MODIFY `precio` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `solicitudes` DROP COLUMN `cliente_nombre`,
    DROP COLUMN `codigo`,
    DROP COLUMN `dni`,
    DROP COLUMN `estado`,
    DROP COLUMN `id_cliente`,
    DROP COLUMN `servicio_solicitado`,
    ADD COLUMN `anio` INTEGER NULL,
    ADD COLUMN `correo` VARCHAR(150) NOT NULL,
    ADD COLUMN `mensaje` VARCHAR(255) NULL,
    ADD COLUMN `modelo` VARCHAR(100) NULL,
    ADD COLUMN `nombre` VARCHAR(150) NOT NULL,
    MODIFY `numero` VARCHAR(20) NOT NULL,
    MODIFY `creado_en` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);
