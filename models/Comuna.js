const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Comuna (División administrativa de una región)
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
