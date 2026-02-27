const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Documento Guardia
 * FUNCIÓN: Gestiona los archivos y documentos asociados a un guardia.
 * USO: Almacena rutas de archivos, estados de aprobación y fechas de vencimiento.
 * -----------------------------------------------------------------------
 * Crítico para el cumplimiento legal y administrativo (ej. Contratos, Certificados OS10).
 */
const DocumentoGuardia = sequelize.define('DocumentoGuardia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ruta_archivo: {
        type: DataTypes.STRING(255) // URL o path del archivo físico
    },
    estado: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pendiente' // Estados: Pendiente, Aprobado, Rechazado
    },
    fecha_vencimiento: {
        type: DataTypes.DATEONLY // Para documentos que expiran (ej. OS10)
    },
    guardia_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo_documento_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'documento_guardia',
    timestamps: false
});

module.exports = DocumentoGuardia;
