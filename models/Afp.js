const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo AFP (Administradora de Fondos de Pensiones)
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
