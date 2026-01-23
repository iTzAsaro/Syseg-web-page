const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo TipoDocumento (Clasificación de documentos: Contrato, OS10, Certificado Antecedentes, etc.)
const TipoDocumento = sequelize.define('TipoDocumento', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    afecta_inventario: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Si el documento implica entrega de EPP (ej. Acta de Entrega)
    }
}, {
    tableName: 'tipo_documento',
    timestamps: false
});

module.exports = TipoDocumento;
