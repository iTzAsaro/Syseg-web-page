const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Producto (Ítems de inventario, ej. Uniformes, EPP)
const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    stock_actual: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    stock_minimo: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Alerta cuando el stock baja de este nivel
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'producto',
    timestamps: false
});

module.exports = Producto;
