const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Local (Lugar físico donde se presta el servicio de seguridad)
const Local = sequelize.define('Local', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(255)
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Activo / Inactivo
    },
    comuna_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'local',
    timestamps: false
});

module.exports = Local;
