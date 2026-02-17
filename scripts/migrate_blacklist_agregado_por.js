const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
require('dotenv').config();

async function columnExists(table, column) {
  const [result] = await sequelize.query(
    `SELECT COUNT(*) AS cnt 
     FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    {
      replacements: {
        schema: process.env.DB_NAME,
        table,
        column
      },
      type: QueryTypes.SELECT
    }
  );
  return result.cnt > 0;
}

async function run() {
  try {
    console.log('Starting migration: add agregado_por to blacklist...');

    const hasAgregadoPor = await columnExists('blacklist', 'agregado_por');
    const hasAgregadoPorId = await columnExists('blacklist', 'agregado_por_id');

    if (!hasAgregadoPor) {
      console.log('Adding column agregado_por (VARCHAR(150) NOT NULL)...');
      await sequelize.query(
        "ALTER TABLE `blacklist` ADD COLUMN `agregado_por` VARCHAR(150) NOT NULL DEFAULT 'Alexsander Rosales'"
      );
    }

    if (!hasAgregadoPorId) {
      console.log('Adding column agregado_por_id (INT NULL)...');
      await sequelize.query(
        "ALTER TABLE `blacklist` ADD COLUMN `agregado_por_id` INT NULL"
      );
    }

    // Add FK constraint if not exists
    const [fkExistsRow] = await sequelize.query(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE CONSTRAINT_SCHEMA = :schema
         AND TABLE_NAME = 'blacklist'
         AND CONSTRAINT_NAME = 'fk_blacklist_agregado_por_id'`,
      {
        replacements: { schema: process.env.DB_NAME },
        type: QueryTypes.SELECT
      }
    );

    if (fkExistsRow.cnt === 0) {
      console.log('Adding foreign key constraint fk_blacklist_agregado_por_id (ON DELETE SET NULL)...');
      await sequelize.query(
        "ALTER TABLE `blacklist` ADD CONSTRAINT `fk_blacklist_agregado_por_id` FOREIGN KEY (`agregado_por_id`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE"
      );
    }

    // Mass update existing rows to the default auditor name
    console.log('Updating existing rows with agregado_por = "Alexsander Rosales" where NULL or empty...');
    await sequelize.query(
      "UPDATE `blacklist` SET `agregado_por` = 'Alexsander Rosales' WHERE `agregado_por` IS NULL OR `agregado_por` = ''"
    );

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
