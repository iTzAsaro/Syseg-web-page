const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Region (División geográfica principal)
const Region = sequelize.define('Region', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    supervisor_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Usuario encargado de supervisar esta región
    }
}, {
    tableName: 'region',
    timestamps: false
});

module.exports = Region;
