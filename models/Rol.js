const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Rol (Perfil de usuario, ej. Administrador, Supervisor)
const Rol = sequelize.define('Rol', {
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
    tableName: 'rol',
    timestamps: false
});

module.exports = Rol;
