const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReporteOperativo = sequelize.define('ReporteOperativo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guardia_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo_incidente: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nivel_riesgo: {
    type: DataTypes.ENUM('bajo', 'medio', 'alto'),
    allowNull: true
  },
  fecha_evento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  hora_evento: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  duracion_estimada: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  lugar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  funcionario_cargo: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  aviso_central: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aviso_jefatura: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creado_por_tipo: {
    type: DataTypes.ENUM('usuario', 'guardia'),
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'reportes_operativos',
  timestamps: true
});

module.exports = ReporteOperativo;

