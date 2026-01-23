const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoMovimiento = sequelize.define('TipoMovimiento', {
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
    tableName: 'tipo_movimiento',
    timestamps: false
});

module.exports = TipoMovimiento;