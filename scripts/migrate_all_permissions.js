const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
require('dotenv').config();

async function ensurePermission(codigo, descripcion) {
  const existing = await sequelize.query(
    'SELECT id FROM `permisos` WHERE codigo = :codigo LIMIT 1',
    {
      replacements: { codigo },
      type: QueryTypes.SELECT
    }
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [id] = await sequelize.query(
    'INSERT INTO `permisos` (codigo, descripcion) VALUES (:codigo, :descripcion)',
    {
      replacements: { codigo, descripcion },
      type: QueryTypes.INSERT
    }
  );

  return id;
}

async function run() {
  try {
    console.log('Starting migration: ensure all permissions exist...');

    const permisos = [
      ['VER_USUARIOS', 'Ver usuarios'],
      ['GESTIONAR_PERMISOS', 'Gestionar permisos de usuarios'],
      ['CREAR_USUARIO', 'Crear usuarios'],
      ['EDITAR_USUARIO', 'Editar usuarios'],
      ['ELIMINAR_USUARIO', 'Eliminar usuarios'],

      ['CREAR_GUARDIA', 'Crear guardias'],
      ['VER_GUARDIAS', 'Ver guardias'],
      ['EDITAR_GUARDIA', 'Editar guardias'],
      ['ELIMINAR_GUARDIA', 'Eliminar guardias'],

      ['VER_INVENTARIO', 'Ver inventario'],
      ['CREAR_PRODUCTO', 'Crear productos'],
      ['EDITAR_PRODUCTO', 'Editar productos'],
      ['ELIMINAR_PRODUCTO', 'Eliminar productos'],
      ['AJUSTAR_STOCK', 'Ajustar stock de inventario'],

      ['CREAR_BITACORA', 'Crear registros de bitácora'],
      ['VER_BITACORA', 'Ver registros de bitácora'],

      ['CREAR_ASIGNACION', 'Crear asignaciones'],
      ['VER_ASIGNACIONES', 'Ver asignaciones'],
      ['ELIMINAR_ASIGNACION', 'Eliminar asignaciones'],

      ['VER_REPORTES', 'Ver reportes'],

      ['VER_BLACKLIST', 'Acceder a lista negra'],
      ['CREAR_BLACKLIST', 'Ingresar guardia a lista negra'],
      ['EDITAR_BLACKLIST', 'Editar guardia en lista negra'],
      ['ELIMINAR_BLACKLIST', 'Eliminar guardia de lista negra']
    ];

    for (const [codigo, descripcion] of permisos) {
      await ensurePermission(codigo, descripcion);
    }

    console.log('All permissions ensured.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
