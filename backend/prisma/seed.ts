import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Contraseña plana del administrador por defecto
const PLAIN_PASSWORD = '123456'; 
const ADMIN_EMAIL = 'admin@scars.com';
const ADMIN_ROL_NAME = 'ADMIN'; 
const SALT_ROUNDS = 10; 

async function main() {
  console.log('Iniciando Seeding de datos iniciales...');

  // 1. Hashear la contraseña (¡Obligatorio!)
  const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, SALT_ROUNDS);
  console.log(`Contraseña para ${ADMIN_EMAIL} hasheada.`);

  // 2. Crear o Encontrar el Rol de Administrador
  const rolAdmin = await prisma.roles.upsert({
    where: { nombre: ADMIN_ROL_NAME },
    update: {},
    create: {
      nombre: ADMIN_ROL_NAME,
    },
  });
  console.log(`✅ Rol ID ${rolAdmin.id_rol} (${rolAdmin.nombre}) creado/encontrado.`);

  // 3. Limpiar permisos antiguos y crear los permisos correctos
  console.log('🧹 Limpiando permisos antiguos...');
  await prisma.rol_permisos.deleteMany({
    where: { id_rol: rolAdmin.id_rol }
  });
  
  // Eliminar permisos que no se usan
  await prisma.permisos.deleteMany({
    where: {
      codigo: {
        notIn: [
          'vehiculo:list', 'vehiculo:create', 'vehiculo:update', 'vehiculo:delete',
          'cliente:list', 'cliente:create', 'cliente:update', 'cliente:delete',
          'servicio.catalogo:list', 'servicio.catalogo:manage',
          'servicio.activo:list', 'servicio.activo:create', 'servicio.activo:update',
          'solicitud:list', 'solicitud:create', 'solicitud:update',
          'auditoria:view',
          'empleado:list', 'empleado:create', 'empleado:update', 'empleado:delete',
          'ADMIN_FULL_ACCESS'
        ]
      }
    }
  });

  const permisosAdmin = [
    'vehiculo:list',
    'vehiculo:create',
    'vehiculo:update',
    'vehiculo:delete',
    'cliente:list',
    'cliente:create',
    'cliente:update',
    'cliente:delete',
    'servicio.catalogo:list',
    'servicio.catalogo:manage',
    'servicio.activo:list',
    'servicio.activo:create',
    'servicio.activo:update',
    'solicitud:list',
    'solicitud:create',
    'solicitud:update',
    'auditoria:view',
    'empleado:list',
    'empleado:create',
    'empleado:update',
    'empleado:delete',
    'ADMIN_FULL_ACCESS'
  ];

  const permisosCreados: any[] = [];
  for (const permisoCodigo of permisosAdmin) {
    const permiso = await prisma.permisos.upsert({
      where: { codigo: permisoCodigo },
      update: {},
      create: {
        codigo: permisoCodigo,
        descripcion: `Permiso para ${permisoCodigo}`,
      },
    });
    permisosCreados.push(permiso);
  }
  console.log(`✅ ${permisosCreados.length} permisos creados/verificados.`);

  // 4. Asignar todos los permisos al rol de Administrador
  for (const permiso of permisosCreados) {
    await prisma.rol_permisos.upsert({
      where: { 
        id_rol_id_permiso: {
          id_rol: rolAdmin.id_rol,
          id_permiso: permiso.id_permiso,
        }
      },
      update: {},
      create: {
        id_rol: rolAdmin.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }
  console.log(`✅ Todos los permisos asignados al rol ${rolAdmin.nombre}.`);

  // 5. Crear o Actualizar el Usuario Administrador
  const adminUser = await prisma.usuarios.upsert({
    where: { correo: ADMIN_EMAIL },
    update: {
        contrasena: hashedPassword, // Solo actualiza el hash si el usuario ya existe
        estado: 'activo',
    },
    create: {
      nombre_usuario: 'Administrador Principal',
      correo: ADMIN_EMAIL,
      contrasena: hashedPassword,
      estado: 'activo',
      fecha_creacion: new Date(),
    },
  });
  console.log(`✅ Usuario ID ${adminUser.id_usuario} (${adminUser.correo}) creado/actualizado.`);

  // 6. Asignar el Rol de Administrador al Usuario (usando la clave compuesta)
  // La clave compuesta es @@id([id_usuario, id_rol]) en tu schema.
  await prisma.usuario_roles.upsert({
    where: { 
        id_usuario_id_rol: { // Esta sintaxis mapea la clave compuesta de la tabla
            id_usuario: adminUser.id_usuario,
            id_rol: rolAdmin.id_rol,
        }
    },
    update: {}, // No necesitamos actualizar nada si ya existe
    create: {
      id_usuario: adminUser.id_usuario,
      id_rol: rolAdmin.id_rol,
    },
  });
  console.log(`✅ Rol '${rolAdmin.nombre}' asignado al usuario ${adminUser.correo}.`);
  console.log(`🎉 Usuario admin tiene ${permisosCreados.length} permisos de acceso total.`);
}

main()
  .catch(async (e) => {
    console.error('❌ Error durante el seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Seeding finalizado.');
  })