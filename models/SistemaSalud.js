const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Sistema de Salud
 * FUNCIÓN: Lista las instituciones de previsión de salud (Fonasa, Isapres).
 * USO: Dato complementario informativo en el perfil del guardia.
 * -----------------------------------------------------------------------
 * Tabla de referencia simple.
 */
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
