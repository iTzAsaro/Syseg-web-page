const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EntregaEpp = sequelize.define('EntregaEpp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null si es un trabajador nuevo no registrado aun, o vincular a Guardia
    },
    nombre_receptor: { // Para guardar el nombre si no tiene usuario
        type: DataTypes.STRING(150),
        allowNull: false
    },
    rut_receptor: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    cargo_receptor: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    responsable_id: { // Quien entrega (Supervisor logueado)
        type: DataTypes.INTEGER,
        allowNull: true 
    },
    fecha_entrega: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    firma_receptor: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('Borrador', 'Firmado'),
        defaultValue: 'Borrador'
    }
}, {
    tableName: 'entrega_epp',
    timestamps: true
});

module.exports = EntregaEpp;
