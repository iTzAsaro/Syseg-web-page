const { Usuario } = require('../models');

async function updateUserName() {
    try {
        const email = 'lrosales@syseg.cl';
        const nuevoNombre = 'Luis Rosales'; // Nombre más amigable
        
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            console.log('❌ Usuario no encontrado.');
            process.exit(1);
        }

        user.nombre = nuevoNombre;
        await user.save();

        console.log(`✅ Usuario actualizado: ${user.email} ahora es "${user.nombre}"`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateUserName();
