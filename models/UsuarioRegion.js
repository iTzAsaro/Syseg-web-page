const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Usuario-Región
 * FUNCIÓN: Tabla intermedia para asignar zonas de supervisión a usuarios.
 * USO: Vincula a un Supervisor con una o más Regiones geográficas.
 * -----------------------------------------------------------------------
 * Relación muchos a muchos (M:N) clave para la segmentación operativa.
 */
const UsuarioRegion = sequelize.define('UsuarioRegion', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    region_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'usuario_region',
    timestamps: false
});

module.exports = UsuarioRegion;