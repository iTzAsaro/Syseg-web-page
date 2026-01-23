const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo MovimientoInventario (Registro de entradas y salidas de stock)
const MovimientoInventario = sequelize.define('MovimientoInventario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_hora: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false // Positivo: Entrada, Negativo: Salida
    },
    stock_resultante: {
        type: DataTypes.INTEGER,
        allowNull: false // Stock después del movimiento
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuario_id: { 
        type: DataTypes.INTEGER,
        allowNull: false // Usuario que registró el movimiento
    },
    documento_asociado_id: { 
        type: DataTypes.INTEGER,
        allowNull: true // Justificación (ej. Entrega de EPP mediante DocumentoGuardia)
    }
}, {
    tableName: 'movimiento_inventario',
    timestamps: false
});

module.exports = MovimientoInventario;
