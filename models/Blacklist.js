const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Lista Negra
 * FUNCIÓN: Define la estructura para el registro de personas bloqueadas (Blacklist).
 * USO: Gestiona restricciones de acceso a recintos basadas en RUT.
 * -----------------------------------------------------------------------
 * Incluye campos para auditar quién realizó el bloqueo y el motivo del mismo.
 */
const Blacklist = sequelize.define('Blacklist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    rut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: false
    },
    recintos: {
        type: DataTypes.STRING(255),
        defaultValue: 'N/A'
    },
    fecha_ingreso: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    fecha_bloqueo: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    motivo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    agregado_por: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    agregado_por_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'blacklist',
    timestamps: true
});

module.exports = Blacklist;
