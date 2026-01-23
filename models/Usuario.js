const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Usuario (Administradores y personal administrativo del sistema web)
const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Activo / Inactivo
    },
    rol_id: {
        type: DataTypes.INTEGER,
        allowNull: false // Rol asignado (ej. Admin, Supervisor)
    }
}, {
    tableName: 'usuario',
    timestamps: false
});

module.exports = Usuario;
