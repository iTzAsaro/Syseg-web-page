/**
 * ================================================================================================
 * NOMBRE: Configuración de Base de Datos (Sequelize)
 * FUNCIÓN: Establece y exporta la conexión a la base de datos MySQL usando variables de entorno.
 * USO: Importar 'sequelize' en modelos/controladores para interactuar con la BD.
 * -----------------------------------------------------------------------
 * Utiliza un pool de conexiones para optimizar el rendimiento y desactiva logs SQL por defecto.
 * ================================================================================================
 */
const Sequelize = require('sequelize');
require('dotenv').config();

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  port: DB_PORT || 3306,
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  define: { timestamps: false, underscored: true }
});

module.exports = sequelize;
