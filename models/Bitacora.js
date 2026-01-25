const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    comment: 'Tipo de acción realizada (LOGIN, CREAR, ACTUALIZAR, ELIMINAR, etc.)'
  },
  detalles: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada o JSON con cambios'
  },
  nivel: {
    type: DataTypes.ENUM('Critica', 'Alta', 'Media', 'Baja', 'Informativa', 'Normal'),
    defaultValue: 'Informativa',
    comment: 'Nivel de severidad del evento'
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Dirección IP desde donde se realizó la acción'
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora del evento'
  }
}, {
  tableName: 'bitacoras',
  timestamps: false // Ya tenemos campo fecha
});

module.exports = Bitacora;
