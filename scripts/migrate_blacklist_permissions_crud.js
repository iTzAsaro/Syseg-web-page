const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
require('dotenv').config();

async function getPermissionId(codigo, descripcion) {
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

  const [result] = await sequelize.query(
    'INSERT INTO `permisos` (codigo, descripcion) VALUES (:codigo, :descripcion)',
    {
      replacements: { codigo, descripcion },
      type: QueryTypes.INSERT
    }
  );

  return result;
}

async function run() {
  try {
    console.log('Starting migration: blacklist permissions CRUD...');

    const gestionarIdRows = await sequelize.query(
      'SELECT id FROM `permisos` WHERE codigo = :codigo LIMIT 1',
      {
        replacements: { codigo: 'GESTIONAR_BLACKLIST' },
        type: QueryTypes.SELECT
      }
    );

    const gestionarId = gestionarIdRows.length > 0 ? gestionarIdRows[0].id : null;

    const crearId = await getPermissionId('CREAR_BLACKLIST', 'Crear registros de blacklist');
    const editarId = await getPermissionId('EDITAR_BLACKLIST', 'Editar registros de blacklist');
    const eliminarId = await getPermissionId('ELIMINAR_BLACKLIST', 'Eliminar registros de blacklist');

    if (gestionarId) {
      console.log('Propagating legacy GESTIONAR_BLACKLIST to new CRUD permissions and removing legacy...');

      await sequelize.query(
        `INSERT IGNORE INTO usuario_permisos (usuario_id, permiso_id)
         SELECT up.usuario_id, :crearId
         FROM usuario_permisos up
         WHERE up.permiso_id = :gestionarId`,
        {
          replacements: { crearId, gestionarId },
          type: QueryTypes.INSERT
        }
      );

      await sequelize.query(
        `INSERT IGNORE INTO usuario_permisos (usuario_id, permiso_id)
         SELECT up.usuario_id, :editarId
         FROM usuario_permisos up
         WHERE up.permiso_id = :gestionarId`,
        {
          replacements: { editarId, gestionarId },
          type: QueryTypes.INSERT
        }
      );

      await sequelize.query(
        `INSERT IGNORE INTO usuario_permisos (usuario_id, permiso_id)
         SELECT up.usuario_id, :eliminarId
         FROM usuario_permisos up
         WHERE up.permiso_id = :gestionarId`,
        {
          replacements: { eliminarId, gestionarId },
          type: QueryTypes.INSERT
        }
      );

      await sequelize.query(
        'DELETE FROM usuario_permisos WHERE permiso_id = :gestionarId',
        {
          replacements: { gestionarId },
          type: QueryTypes.DELETE
        }
      );

      await sequelize.query(
        'DELETE FROM permisos WHERE id = :gestionarId',
        {
          replacements: { gestionarId },
          type: QueryTypes.DELETE
        }
      );
    } else {
      console.log('No legacy GESTIONAR_BLACKLIST permission found, only ensured CRUD permissions.');
    }

    console.log('Migration blacklist permissions CRUD completed (legacy cleaned if existed).');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
