const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
require('dotenv').config();

async function run() {
  try {
    console.log('Starting backfill: set agregado_por_id based on Usuario.nombre...');

    // Attempt to set agregado_por_id for all rows where it is NULL by matching Usuario.nombre
    const sql = `
      UPDATE blacklist b
      JOIN usuario u ON u.nombre = b.agregado_por
      SET b.agregado_por_id = u.id
      WHERE b.agregado_por_id IS NULL
    `;

    const result = await sequelize.query(sql, { type: QueryTypes.UPDATE });
    console.log('Backfill completed:', result);
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

run();
