const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Tipo de Documento
 * FUNCIÓN: Clasifica los documentos que pueden asociarse a un guardia.
 * USO: Define categorías (Contrato, OS10) y si el documento afecta inventario.
 * -----------------------------------------------------------------------
 * Permite organizar la documentación legal y administrativa del personal.
 */
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
