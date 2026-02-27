const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Región
 * FUNCIÓN: Define la división geográfica principal del país.
 * USO: Agrupador de nivel superior para Comunas y asignación de zonas a Supervisores.
 * -----------------------------------------------------------------------
 * Estructura base para la segmentación territorial operativa.
 */
const Region = sequelize.define('Region', {
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
    tableName: 'region',
    timestamps: false
});

module.exports = Region;
