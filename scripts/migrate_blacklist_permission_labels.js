const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
require('dotenv').config();

async function run() {
  try {
    console.log('Updating blacklist permission labels...');

    const updates = [
      ['VER_BLACKLIST', 'Acceder a lista negra'],
      ['CREAR_BLACKLIST', 'Ingresar guardia a lista negra'],
      ['EDITAR_BLACKLIST', 'Editar guardia en lista negra'],
      ['ELIMINAR_BLACKLIST', 'Eliminar guardia de lista negra']
    ];

    for (const [codigo, descripcion] of updates) {
      await sequelize.query(
        'UPDATE `permisos` SET descripcion = :descripcion WHERE codigo = :codigo',
        {
          replacements: { codigo, descripcion },
          type: QueryTypes.UPDATE
        }
      );
    }

    console.log('Blacklist permission labels updated.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
