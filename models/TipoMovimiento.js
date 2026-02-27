const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Tipo de Movimiento
 * FUNCIÓN: Define la naturaleza de un cambio de inventario.
 * USO: Clasifica movimientos como 'Compra', 'Entrega', 'Devolución', 'Ajuste'.
 * -----------------------------------------------------------------------
 * Esencial para reportes y análisis de flujo de stock.
 */
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