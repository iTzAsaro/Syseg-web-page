const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Guardia (Personal de seguridad, gestiona perfil, tallas y datos bancarios)
const Guardia = sequelize.define('Guardia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true // Identificador único nacional
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true // Puede ser nulo si no ha activado la app
    },
    fcm_token: {
        type: DataTypes.STRING(255),
        allowNull: true // Token para notificaciones push
    },
    activo_app: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Habilitado para usar la app
    },
    ultimo_acceso: {
        type: DataTypes.DATE // Registro de último login
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    tipo_contrato: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'CONTRATADO'
    },
    celular: {
        type: DataTypes.STRING(20)
    },
    nombre_emergencia: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    fono_emergencia: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    talla_camisa: {
        type: DataTypes.STRING(10)
    },
    talla_pantalon: {
        type: DataTypes.STRING(10)
    },
    talla_zapato: {
        type: DataTypes.STRING(10)
    },
    banco_nombre: {
        type: DataTypes.STRING(100)
    },
    banco_tipo_cuenta: {
        type: DataTypes.STRING(50) // Cuenta Rut, Vista, Corriente, etc.
    },
    banco_numero_cuenta: {
        type: DataTypes.STRING(50)
    },
    // local_id eliminado (la asignación es dinámica por turno, no fija)
    afp_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Asociación con AFP (Opcional por ahora)
    },
    salud_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Asociación con Sistema de Salud (Opcional por ahora)
    },
    civil_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Estado Civil
    },
    comuna_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Comuna de residencia (Opcional por ahora)
    }
}, {
    tableName: 'guardia',
    timestamps: false
});

module.exports = Guardia;
