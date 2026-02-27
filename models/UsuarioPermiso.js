const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Usuario-Permiso
 * FUNCIÓN: Tabla intermedia para asignar permisos específicos a usuarios.
 * USO: Permite extender los privilegios de un usuario más allá de su rol base.
 * -----------------------------------------------------------------------
 * Implementa una relación muchos a muchos (M:N) para granularidad fina.
 */
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
    tableName: 'usuario_permisos',
    timestamps: false
});

module.exports = UsuarioPermiso;
