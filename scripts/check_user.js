const { Usuario, Permiso, UsuarioPermiso } = require('../models');

async function checkUserPermissions() {
    try {
        const email = 'lrosales@syseg.cl';
        const user = await Usuario.findOne({
            where: { email },
            include: [{
                model: Permiso,
                attributes: ['codigo'],
                through: { attributes: [] }
            }]
        });

        if (!user) {
            console.log(`Usuario ${email} no encontrado.`);
        } else {
            console.log(`Usuario encontrado: ${user.nombre} (ID: ${user.id}, Rol: ${user.rol_id})`);
            console.log(`Estado: ${user.estado ? 'Activo' : 'Inactivo'}`);
            console.log(`Permisos asignados (${user.Permisos.length}):`);
            user.Permisos.forEach(p => console.log(` - ${p.codigo}`));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUserPermissions();
