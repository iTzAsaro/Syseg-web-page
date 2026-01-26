const sequelize = require('./config/database');
const { Usuario, Auditoria } = require('./models');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida exitosamente.');

        // Sincronizar modelos
        // alter: true intenta adaptar la tabla existente al nuevo modelo
        await Usuario.sync({ alter: true });
        await Auditoria.sync({ alter: true });

        console.log('Tablas sincronizadas correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    } finally {
        await sequelize.close();
    }
};

syncDatabase();
