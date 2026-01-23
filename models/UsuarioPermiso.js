const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo UsuarioPermiso (Tabla pivote para asignar permisos extra a usuarios específicos)
const UsuarioPermiso = sequelize.define('UsuarioPermiso', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'usuario_permiso',
    timestamps: false
});

module.exports = UsuarioPermiso;
