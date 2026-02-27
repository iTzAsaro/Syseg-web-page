const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo AFP
 * FUNCIÓN: Define la estructura de la tabla de Administradoras de Fondos de Pensiones.
 * USO: Interactúa con la base de datos para gestionar información de AFPs.
 * -----------------------------------------------------------------------
 * Tabla de referencia simple utilizada en la gestión de personal (Guardias).
 */
const Afp = sequelize.define('Afp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'afp',
    timestamps: false
});

module.exports = Afp;
