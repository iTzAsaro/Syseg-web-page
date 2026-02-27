const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Auditoría
 * FUNCIÓN: Define la estructura para el registro histórico de acciones críticas del sistema.
 * USO: Almacena eventos como creación, modificación o eliminación de entidades.
 * -----------------------------------------------------------------------
 * El campo 'detalles' almacena un JSON stringified para flexibilidad en la data guardada.
 */
const Auditoria = sequelize.define('Auditoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    objetivo_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    accion: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    detalles: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'auditoria',
    timestamps: false
});

module.exports = Auditoria;
