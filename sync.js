const { sequelize } = require('./models');

// Función para sincronizar la base de datos
async function sincronizarBaseDeDatos() {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida exitosamente.');
        
        // Alter: true actualiza las tablas sin eliminarlas ni perder datos
        await sequelize.sync({ alter: true });
        console.log('Base de datos sincronizada exitosamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    } finally {
        await sequelize.close();
    }
}

sincronizarBaseDeDatos();
