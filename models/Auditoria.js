const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null si el usuario fue eliminado, o setNull on delete
    },
    objetivo_id: {
        type: DataTypes.INTEGER,
        allowNull: true // ID del usuario/entidad afectada
    },
    accion: {
        type: DataTypes.STRING(100),
        allowNull: false // Ej: 'CREAR_USUARIO', 'MODIFICAR_PERMISOS'
    },
    detalles: {
        type: DataTypes.TEXT, // JSON stringified
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'auditoria',
    timestamps: false
});

module.exports = Auditoria;
