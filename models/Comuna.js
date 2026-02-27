const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Comuna
 * FUNCIÓN: Define la división administrativa de una región.
 * USO: Gestiona las comunas asociadas a una región específica.
 * -----------------------------------------------------------------------
 * Esencial para la ubicación geográfica precisa de locales y domicilios de guardias.
 */
const Comuna = sequelize.define('Comuna', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    region_id: {
        type: DataTypes.INTEGER,
        allowNull: false // Clave foránea a Región
    }
}, {
    tableName: 'comuna',
    timestamps: false
});

module.exports = Comuna;
