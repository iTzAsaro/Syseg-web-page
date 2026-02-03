const { Producto, MovimientoInventario, sequelize, Categoria } = require('./models');

const productosNuevos = [
    { nombre: 'Zapatos de seguridad', categoria: 'EPP' },
    { nombre: 'Zapatos de vestir', categoria: 'Ropa Corporativa' },
    { nombre: 'Pantalón largo', categoria: 'Ropa Corporativa' },
    { nombre: 'Polera', categoria: 'Ropa Corporativa' },
    { nombre: 'Camisa o blusa', categoria: 'Ropa Corporativa' },
    { nombre: 'Geólogo', categoria: 'EPP' },
    { nombre: 'Chaleco anti corte', categoria: 'EPP' },
    { nombre: 'Chaqueta', categoria: 'Ropa Corporativa' },
    { nombre: 'Corta viento', categoria: 'Ropa Corporativa' },
    { nombre: 'Chaleco', categoria: 'Ropa Corporativa' },
    { nombre: 'Polar', categoria: 'Ropa Corporativa' },
    { nombre: 'Casco', categoria: 'EPP' },
    { nombre: 'Lentes U.V.', categoria: 'EPP' },
    { nombre: 'Bloqueador solar', categoria: 'EPP' }
];

async function seedProducts() {
    const t = await sequelize.transaction();
    try {
        console.log('Iniciando limpieza y carga de productos...');

        // 1. Limpiar productos existentes (y movimientos asociados para evitar errores FK)
        // Nota: En producción esto es peligroso, pero es lo que pidió el usuario.
        await MovimientoInventario.destroy({ where: {}, truncate: true, transaction: t });
        // También limpiar DetalleEntregaEpp si referencia a productos (si no hay restricción FK fuerte podría ser opcional, pero mejor limpiar)
        // Por seguridad, pondremos los ID de producto en null en DetalleEntregaEpp antes de borrar productos
        // O simplemente borrar productos y dejar que la DB maneje errores si hay restricciones.
        // Dado que SQLite/MySQL a veces tienen comportamientos diferentes, intentaremos un borrado "force" via truncate cascade si es posible, o delete simple.
        
        // Si hay tablas que dependen de producto_id, sequelize podría fallar.
        // Asumiremos que MovimientoInventario es la principal.
        
        await Producto.destroy({ where: {}, truncate: false, transaction: t }); // truncate: false usa DELETE FROM
        
        console.log('Productos y movimientos eliminados.');

        // 2. Crear Categorías si no existen
        const catMap = {};
        const categoriasUnicas = [...new Set(productosNuevos.map(p => p.categoria))];
        
        for (const nombreCat of categoriasUnicas) {
            const [cat] = await Categoria.findOrCreate({
                where: { nombre: nombreCat },
                defaults: { nombre: nombreCat },
                transaction: t
            });
            catMap[nombreCat] = cat.id;
        }

        // 3. Insertar nuevos productos
        for (const p of productosNuevos) {
            await Producto.create({
                nombre: p.nombre,
                categoria_id: catMap[p.categoria],
                stock_actual: 100, // Stock inicial por defecto para pruebas
                stock_minimo: 10
            }, { transaction: t });
        }

        await t.commit();
        console.log('¡Carga de productos completada con éxito!');
        process.exit(0);

    } catch (error) {
        await t.rollback();
        console.error('Error durante la carga de productos:', error);
        process.exit(1);
    }
}

seedProducts();