const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Bitácora
 * FUNCIÓN: Define la estructura para el registro de novedades operativas y logs del sistema.
 * USO: Centraliza eventos con niveles de severidad, categorías y rastreo de IP.
 * -----------------------------------------------------------------------
 * Soporta registro automático de IP y distinción entre autor (nombre) y usuario_id (FK).
 */
const Bitacora = sequelize.define('Bitacora', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del usuario que realizó la acción'
  },
  autor: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del usuario o sistema'
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tipo de acción realizada'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la novedad'
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoría de la novedad'
  },
  prioridad: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Prioridad operativa'
  },
  nivel: {
    type: DataTypes.ENUM('Critica', 'Alta', 'Media', 'Baja', 'Informativa', 'Normal'),
    defaultValue: 'Informativa',
    comment: 'Nivel de severidad del sistema'
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Dirección IP de origen'
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora del evento'
  }
}, {
  tableName: 'bitacoras',
  timestamps: false
});

module.exports = Bitacora;
