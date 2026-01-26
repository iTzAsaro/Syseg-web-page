const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Asignacion
 * Representa la asignación de un turno a un guardia en un local específico.
 */
const Asignacion = sequelize.define('Asignacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    turno: {
        type: DataTypes.STRING(20), // Mañana, Tarde, Noche
        allowNull: false
    },
    hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING(20), // Programado, Completado, Ausente, Licencia
        defaultValue: 'Programado'
    },
    observacion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    guardia_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    local_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'asignaciones',
    timestamps: true // Para registro de fecha de creación y actualización
});

module.exports = Asignacion;
