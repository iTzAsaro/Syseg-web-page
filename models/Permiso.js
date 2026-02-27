const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Permiso
 * FUNCIÓN: Define las acciones específicas autorizadas dentro del sistema.
 * USO: Control de acceso granular (RBAC) mediante códigos únicos (ej. VER_USUARIOS).
 * -----------------------------------------------------------------------
 * Se asignan a usuarios directamente para habilitar funcionalidades específicas.
 */
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
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'permisos',
    timestamps: false
});

module.exports = Permiso;
