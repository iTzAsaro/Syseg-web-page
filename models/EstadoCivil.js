const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EstadoCivil = sequelize.define('EstadoCivil', {
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
    tableName: 'estado_civil',
    timestamps: false
});

module.exports = EstadoCivil;