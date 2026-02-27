const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Detalle Entrega EPP
 * FUNCIÓN: Define los ítems individuales dentro de una entrega de EPP.
 * USO: Relaciona productos, cantidades y tallas con una entrega principal.
 * -----------------------------------------------------------------------
 * Permite desglosar qué elementos específicos (Ropa o EPP) se entregaron en una transacción.
 */
const DetalleEntregaEpp = sequelize.define('DetalleEntregaEpp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    entrega_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nombre_producto: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    talla: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING(50), // 'Ropa', 'EPP'
        defaultValue: 'Ropa'
    }
}, {
    tableName: 'detalle_entrega_epp',
    timestamps: false
});

module.exports = DetalleEntregaEpp;
