const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Producto
 * FUNCIÓN: Define los ítems gestionables en el inventario (Uniformes, EPP, etc.).
 * USO: Almacena información de stock actual, alertas de mínimo y categorización.
 * -----------------------------------------------------------------------
 * Objeto central del módulo de logística e inventario.
 */
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
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
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
