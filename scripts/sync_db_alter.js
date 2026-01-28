const { sequelize } = require('../models');

async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log("Base de datos sincronizada correctamente (Alter: true).");
    } catch (error) {
        console.error("Error al sincronizar base de datos:", error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
