const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Asignación
 * FUNCIÓN: Define la estructura para la gestión de turnos de guardias en locales.
 * USO: Registra la relación entre guardia, local, fecha y horario de servicio.
 * -----------------------------------------------------------------------
 * Base central del módulo de programación de turnos. Incluye timestamps automáticos.
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
    timestamps: true
});

module.exports = Asignacion;
