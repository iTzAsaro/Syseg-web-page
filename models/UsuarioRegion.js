const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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