const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Categoria (Para clasificar productos)
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
