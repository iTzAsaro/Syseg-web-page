const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Estado Civil
 * FUNCIÓN: Define los posibles estados civiles de una persona.
 * USO: Clasificación demográfica para los perfiles de guardias.
 * -----------------------------------------------------------------------
 * Tabla de referencia simple utilizada en formularios de datos personales.
 */
const EstadoCivil = sequelize.define('EstadoCivil', {
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
    tableName: 'estado_civil',
    timestamps: false
});

module.exports = EstadoCivil;