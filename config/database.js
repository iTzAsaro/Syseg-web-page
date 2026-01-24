// Importar la biblioteca Sequelize para interactuar con la base de datos
const Sequelize = require('sequelize');
// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Inicializar una nueva instancia de Sequelize para la conexión a la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME, // Nombre de la base de datos
    process.env.DB_USER, // Usuario de la base de datos
    process.env.DB_PASS, // Contraseña de la base de datos
    {
        host: process.env.DB_HOST, // Host de la base de datos (ej. localhost o IP remota)
        dialect: 'mysql', // Dialecto de la base de datos (en este caso, MySQL)
        port: process.env.DB_PORT || 3306, // Puerto de conexión (por defecto 3306)
        logging: false, // Desactivar el registro de consultas SQL en la consola
        pool: {
            max: 5, // Número máximo de conexiones en el pool
            min: 0, // Número mínimo de conexiones en el pool
            acquire: 30000, // Tiempo máximo (ms) para intentar conectar antes de lanzar error
            idle: 10000 // Tiempo máximo (ms) que una conexión puede estar inactiva antes de ser liberada
        },
        define: {
            timestamps: false, // No agregar automáticamente los campos createdAt y updatedAt a las tablas
            underscored: true // Usar snake_case para los nombres de campos generados automáticamente
        }
    }
);

// Exportar la instancia de sequelize para usarla en otros archivos del proyecto
module.exports = sequelize;
