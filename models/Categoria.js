const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Categoría
 * FUNCIÓN: Define la estructura para clasificar productos.
 * USO: Permite agrupar productos en categorías lógicas para el inventario.
 * -----------------------------------------------------------------------
 * Tabla simple utilizada para organizar el catálogo de productos.
 */
const Categoria = sequelize.define('Categoria', {
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
    tableName: 'categoria',
    timestamps: false
});

module.exports = Categoria;
