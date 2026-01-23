const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo SistemaSalud (Fonasa, Isapre, etc.)
const SistemaSalud = sequelize.define('SistemaSalud', {
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
    tableName: 'sistema_salud',
    timestamps: false
});

module.exports = SistemaSalud;
