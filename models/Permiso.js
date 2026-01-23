const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Permiso (Define acciones específicas que un usuario puede realizar)
const Permiso = sequelize.define('Permiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true // Ej: 'VER_USUARIOS', 'EDITAR_GUARDIA'
    }
}, {
    tableName: 'permisos',
    timestamps: false
});

module.exports = Permiso;
