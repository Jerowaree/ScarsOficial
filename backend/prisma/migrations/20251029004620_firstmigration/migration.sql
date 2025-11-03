-- CreateTable
CREATE TABLE `auditoria` (
    `id_auditoria` BIGINT NOT NULL AUTO_INCREMENT,
    `entidad` VARCHAR(100) NOT NULL,
    `id_entidad` VARCHAR(50) NOT NULL,
    `accion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    `antes` LONGTEXT NULL,
    `despues` LONGTEXT NULL,
    `actor_usuario_id` INTEGER NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `creado_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_aud_entidad`(`entidad`, `id_entidad`),
    INDEX `idx_aud_usuario`(`actor_usuario_id`, `creado_en`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `dni` VARCHAR(8) NULL,
    `ruc` VARCHAR(11) NULL,
    `genero` ENUM('Masculino', 'Femenino', 'No especificado') NULL,
    `correo` VARCHAR(150) NULL,
    `celular` VARCHAR(15) NULL,
    `direccion` VARCHAR(200) NULL,
    `fecha_nacimiento` DATE NULL,
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codigo`(`codigo`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_servicio_activo` (
    `id_detalle` INTEGER NOT NULL AUTO_INCREMENT,
    `id_servicio_activo` INTEGER NOT NULL,
    `id_servicio_catalogo` INTEGER NOT NULL,

    INDEX `id_servicio_catalogo`(`id_servicio_catalogo`),
    UNIQUE INDEX `uk_activo_servicio`(`id_servicio_activo`, `id_servicio_catalogo`),
    PRIMARY KEY (`id_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleados` (
    `id_empleado` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `dni` VARCHAR(8) NULL,
    `correo` VARCHAR(150) NULL,
    `celular` VARCHAR(15) NULL,
    `cargo` VARCHAR(100) NULL,
    `sueldo` DECIMAL(10, 2) NULL,
    `horario` ENUM('Mañana', 'Tarde', 'Mañana y Tarde') NULL DEFAULT 'Mañana',
    `estado` ENUM('Activo', 'Inactivo') NULL DEFAULT 'Activo',
    `id_usuario` INTEGER NULL,

    UNIQUE INDEX `codigo`(`codigo`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_empleado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_bloqueos` (
    `id_usuario` INTEGER NOT NULL,
    `bloqueado_hasta` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_intentos` (
    `id_intento` BIGINT NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `correo_intento` VARCHAR(150) NULL,
    `exitoso` BOOLEAN NOT NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `creado_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_login_correo`(`correo_intento`, `creado_en`),
    INDEX `idx_login_user`(`id_usuario`, `creado_en`),
    PRIMARY KEY (`id_intento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisos` (
    `id_permiso` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NULL,

    UNIQUE INDEX `codigo`(`codigo`),
    PRIMARY KEY (`id_permiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol_permisos` (
    `id_rol` INTEGER NOT NULL,
    `id_permiso` INTEGER NOT NULL,

    INDEX `id_permiso`(`id_permiso`),
    PRIMARY KEY (`id_rol`, `id_permiso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_activos` (
    `id_servicio_activo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_vehiculo` INTEGER NOT NULL,
    `numero_seguimiento` VARCHAR(20) NOT NULL,
    `cliente_nombre` VARCHAR(150) NOT NULL,
    `placa` VARCHAR(10) NOT NULL,
    `tipo` ENUM('Automóvil', 'Moto') NOT NULL,
    `proceso` ENUM('Recepción del vehículo', 'Diagnóstico técnico', 'Evaluación y presupuesto', 'Aprobación del cliente', 'En espera de suministro', 'Ejecución del servicio', 'Control de calidad', 'Entrega del vehículo', 'Cierre del servicio') NULL DEFAULT 'Recepción del vehículo',
    `fecha` DATE NOT NULL,
    `observaciones` TEXT NULL,
    `evidencia_tipo` ENUM('imagen', 'video') NULL,
    `evidencia_url` VARCHAR(255) NULL,
    `estado` ENUM('En curso', 'Finalizado', 'Cancelado') NULL DEFAULT 'En curso',
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `numero_seguimiento`(`numero_seguimiento`),
    INDEX `created_by`(`created_by`),
    INDEX `id_vehiculo`(`id_vehiculo`),
    INDEX `idx_activos_cliente_fecha`(`id_cliente`, `fecha`),
    INDEX `idx_activos_placa`(`placa`),
    INDEX `updated_by`(`updated_by`),
    PRIMARY KEY (`id_servicio_activo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_catalogo` (
    `id_servicio` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo_media` ENUM('imagen', 'video') NULL DEFAULT 'imagen',
    `url_media` VARCHAR(255) NULL,
    `estado` ENUM('Activo', 'No Activo') NULL DEFAULT 'Activo',
    `creado_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `actualizado_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codigo`(`codigo`),
    PRIMARY KEY (`id_servicio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicios_concluidos` (
    `id_concluido` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_vehiculo` INTEGER NOT NULL,
    `cliente_nombre` VARCHAR(150) NOT NULL,
    `placa` VARCHAR(10) NOT NULL,
    `tipo` ENUM('Automóvil', 'Moto') NOT NULL,
    `fecha` DATE NOT NULL,
    `servicios_json` LONGTEXT NOT NULL,
    `observaciones` TEXT NULL,
    `estado` ENUM('Finalizado') NULL DEFAULT 'Finalizado',

    INDEX `id_vehiculo`(`id_vehiculo`),
    INDEX `idx_concl_cliente_fecha`(`id_cliente`, `fecha`),
    INDEX `idx_concl_placa`(`placa`),
    PRIMARY KEY (`id_concluido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones` (
    `id_sesion` BIGINT NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `refresh_token` VARCHAR(255) NOT NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `expira_en` DATETIME(0) NOT NULL,
    `creada_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `revocada_en` DATETIME(0) NULL,

    INDEX `idx_ses_usuario`(`id_usuario`, `expira_en`),
    PRIMARY KEY (`id_sesion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitudes` (
    `id_solicitud` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(10) NOT NULL,
    `id_cliente` INTEGER NULL,
    `cliente_nombre` VARCHAR(150) NOT NULL,
    `dni` VARCHAR(8) NULL,
    `numero` VARCHAR(20) NULL,
    `servicio_solicitado` VARCHAR(100) NULL,
    `detalle` TEXT NULL,
    `estado` ENUM('En espera', 'Atendido') NULL DEFAULT 'En espera',
    `creado_en` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `codigo`(`codigo`),
    INDEX `id_cliente`(`id_cliente`),
    PRIMARY KEY (`id_solicitud`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_roles` (
    `id_usuario` INTEGER NOT NULL,
    `id_rol` INTEGER NOT NULL,

    INDEX `id_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`, `id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_usuario` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(150) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `estado` ENUM('activo', 'inactivo') NULL DEFAULT 'activo',
    `fecha_creacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `correo`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculos` (
    `id_vehiculo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `placa` VARCHAR(10) NOT NULL,
    `tipo` ENUM('Automóvil', 'Moto') NOT NULL,
    `color` VARCHAR(50) NULL,
    `marca` VARCHAR(50) NULL,
    `modelo` VARCHAR(50) NULL,
    `anio` YEAR NULL,
    `observaciones` TEXT NULL,

    UNIQUE INDEX `placa`(`placa`),
    INDEX `id_cliente`(`id_cliente`),
    PRIMARY KEY (`id_vehiculo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`actor_usuario_id`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_servicio_activo` ADD CONSTRAINT `detalle_servicio_activo_ibfk_1` FOREIGN KEY (`id_servicio_activo`) REFERENCES `servicios_activos`(`id_servicio_activo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_servicio_activo` ADD CONSTRAINT `detalle_servicio_activo_ibfk_2` FOREIGN KEY (`id_servicio_catalogo`) REFERENCES `servicios_catalogo`(`id_servicio`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `empleados` ADD CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `login_bloqueos` ADD CONSTRAINT `login_bloqueos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `login_intentos` ADD CONSTRAINT `login_intentos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rol_permisos` ADD CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rol_permisos` ADD CONSTRAINT `rol_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos`(`id_permiso`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_activos` ADD CONSTRAINT `servicios_activos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_activos` ADD CONSTRAINT `servicios_activos_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_activos` ADD CONSTRAINT `servicios_activos_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_activos` ADD CONSTRAINT `servicios_activos_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_concluidos` ADD CONSTRAINT `servicios_concluidos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicios_concluidos` ADD CONSTRAINT `servicios_concluidos_ibfk_2` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sesiones` ADD CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `solicitudes` ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuario_roles` ADD CONSTRAINT `usuario_roles_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuario_roles` ADD CONSTRAINT `usuario_roles_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vehiculos` ADD CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;
