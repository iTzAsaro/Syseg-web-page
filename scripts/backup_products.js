const { Producto } = require('../models');
const fs = require('fs');
const path = require('path');

async function backup() {
    try {
        console.log('Iniciando backup de la tabla Producto...');
        const productos = await Producto.findAll();
        const data = JSON.stringify(productos, null, 2);
        
        const backupPath = path.join(__dirname, '../backups/productos_backup.json');
        fs.writeFileSync(backupPath, data);
        
        console.log(`Backup completado exitosamente. Guardado en: ${backupPath}`);
        console.log(`Total registros: ${productos.length}`);
        process.exit(0);
    } catch (error) {
        console.error('Error durante el backup:', error);
        process.exit(1);
    }
}

backup();