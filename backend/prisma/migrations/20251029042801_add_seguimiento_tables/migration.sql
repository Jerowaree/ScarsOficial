-- CreateTable
CREATE TABLE `seguimientos` (
    `id_seguimiento` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `id_cliente` INTEGER NOT NULL,
    `id_vehiculo` INTEGER NOT NULL,
    `estado` ENUM('Pendiente', 'En Proceso', 'Finalizado', 'Cancelado') NULL DEFAULT 'Pendiente',
    `fecha_inicio` DATE NULL,
    `fecha_estimada` DATE NULL,
    `observaciones` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codigo`(`codigo`),
    INDEX `id_cliente`(`id_cliente`),
    INDEX `id_vehiculo`(`id_vehiculo`),
    INDEX `idx_seguimiento_codigo`(`codigo`),
    PRIMARY KEY (`id_seguimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seguimiento_servicios` (
    `id_seguimiento` INTEGER NOT NULL,
    `id_servicio` INTEGER NOT NULL,

    INDEX `id_servicio`(`id_servicio`),
    PRIMARY KEY (`id_seguimiento`, `id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seguimientos` ADD CONSTRAINT `seguimientos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `seguimientos` ADD CONSTRAINT `seguimientos_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `seguimiento_servicios` ADD CONSTRAINT `seguimiento_servicios_ibfk_1` FOREIGN KEY (`id_seguimiento`) REFERENCES `seguimientos`(`id_seguimiento`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `seguimiento_servicios` ADD CONSTRAINT `seguimiento_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios_catalogo`(`id_servicio`) ON DELETE RESTRICT ON UPDATE RESTRICT;
