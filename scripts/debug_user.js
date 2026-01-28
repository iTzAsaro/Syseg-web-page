const { Usuario, Permiso, Rol } = require('../models');

async function checkUser() {
    try {
        const email = 'lrosales@syseg.cl';
        console.log(`Buscando usuario: ${email}...`);
        
        const user = await Usuario.findOne({
            where: { email },
            include: [
                { model: Rol },
                { 
                    model: Permiso,
                    attributes: ['codigo'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!user) {
            console.log('❌ Usuario NO encontrado en la base de datos.');
        } else {
            console.log('✅ Usuario encontrado:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Nombre: "${user.nombre}"`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Rol ID: ${user.rol_id}`);
            console.log(`   Rol Nombre: ${user.Rol ? user.Rol.nombre : 'Sin Rol'}`);
            console.log(`   Estado: ${user.estado ? 'Activo' : 'Inactivo'}`);
            console.log(`   Permisos (${user.Permisos.length}):`);
            if (user.Permisos.length > 0) {
                console.log('   - ' + user.Permisos.map(p => p.codigo).slice(0, 5).join(', ') + (user.Permisos.length > 5 ? '...' : ''));
            } else {
                console.log('   ⚠️ No tiene permisos asignados.');
            }
        }
    } catch (error) {
        console.error('❌ Error al consultar base de datos:', error);
    } finally {
        process.exit();
    }
}

checkUser();
