const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Rol
 * FUNCIÓN: Define los perfiles de usuario disponibles en el sistema.
 * USO: Determina el nivel de acceso general y privilegios (ej. Administrador, Supervisor).
 * -----------------------------------------------------------------------
 * Base del sistema de control de acceso (RBAC) junto con los Permisos.
 */
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
