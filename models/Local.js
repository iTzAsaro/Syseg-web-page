const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * NOMBRE: Modelo Local
 * FUNCIÓN: Define los lugares físicos donde se presta el servicio de seguridad.
 * USO: Registra nombre, dirección, estado y ubicación geográfica de los recintos.
 * -----------------------------------------------------------------------
 * Entidad clave para la asignación de turnos y gestión de clientes.
 */
const Local = sequelize.define('Local', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(255)
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true // Activo / Inactivo
    },
    comuna_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'local',
    timestamps: false
});

module.exports = Local;
