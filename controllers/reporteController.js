const { Op, Sequelize } = require('sequelize');
const { MovimientoInventario, Producto, Categoria, Bitacora, Usuario, Rol } = require('../models');
const sequelize = require('../config/database');

/**
 * Obtener estadísticas para el dashboard de reportes
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Actividad Semanal (Movimientos de Inventario de los últimos 7 días)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const movimientos = await MovimientoInventario.findAll({
            where: {
                fecha_hora: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('fecha_hora')), 'fecha'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END")), 'ingresos'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN cantidad < 0 THEN ABS(cantidad) ELSE 0 END")), 'retiros']
            ],
            group: [sequelize.fn('DATE', sequelize.col('fecha_hora'))],
            order: [[sequelize.fn('DATE', sequelize.col('fecha_hora')), 'ASC']]
        });

        // Formatear para el frontend (Lun, Mar, etc.)
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const activityData = movimientos.map(m => {
            const date = new Date(m.get('fecha'));
            // Ajuste por zona horaria si es necesario, pero simple por ahora
            return {
                day: days[date.getDay()],
                ingresos: parseInt(m.get('ingresos')) || 0,
                retiros: parseInt(m.get('retiros')) || 0,
                // Calculamos un valor normalizado para la altura de la barra si se desea, 
                // o enviamos los valores crudos y el frontend decide.
                // El frontend actual usa 'val' (porcentaje). Vamos a enviar los crudos y que el frontend adapte.
                rawDate: m.get('fecha')
            };
        });

        // 2. Top 5 Productos Más Solicitados (Salidas históricas o del último mes)
        // Vamos a tomar histórico global para tener datos, o filtrar si se prefiere.
        const topProductos = await MovimientoInventario.findAll({
            where: {
                cantidad: { [Op.lt]: 0 } // Solo salidas
            },
            attributes: [
                'producto_id',
                [sequelize.fn('SUM', sequelize.literal('ABS(cantidad)')), 'total_salidas']
            ],
            include: [{
                model: Producto,
                attributes: ['nombre'],
                include: [{
                    model: Categoria,
                    attributes: ['nombre']
                }]
            }],
            group: ['producto_id', 'Producto.id', 'Producto.nombre', 'Producto->Categorium.id', 'Producto->Categorium.nombre'],
            order: [[sequelize.literal('total_salidas'), 'DESC']],
            limit: 5
        });

        const topItems = topProductos.map(item => ({
            name: item.Producto.nombre,
            cat: item.Producto.Categorium ? item.Producto.Categorium.nombre : 'General',
            count: parseInt(item.get('total_salidas')),
            max: 0 // El frontend calculará el max relativo
        }));

        // Calcular el maximo para las barras de progreso
        const maxCount = topItems.length > 0 ? Math.max(...topItems.map(i => i.count)) : 100;
        topItems.forEach(i => i.max = maxCount * 1.2); // Un poco más del maximo para margen

        // 3. Últimos Eventos (Bitácora)
        const bitacora = await Bitacora.findAll({
            limit: 10,
            order: [['fecha', 'DESC']],
            include: [{
                model: Usuario,
                attributes: ['nombre'],
                include: [{
                    model: Rol,
                    attributes: ['nombre']
                }]
            }]
        });

        const recentEvents = bitacora.map(b => ({
            id: b.id,
            type: determineEventType(b.accion), // Helper para mapear acción a tipo visual
            action: b.accion,
            detail: b.detalles,
            user: b.Usuario ? b.Usuario.nombre : b.autor,
            role: b.Usuario && b.Usuario.Rol ? b.Usuario.Rol.nombre : 'Sistema',
            time: new Date(b.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(b.fecha).toLocaleDateString(),
            status: b.nivel === 'Critica' ? 'critical' : (b.nivel === 'Informativa' ? 'info' : 'success')
        }));

        res.json({
            activityData,
            topItems,
            recentEvents
        });

    } catch (error) {
        console.error('Error obteniendo reportes:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener reportes.' });
    }
};

// Helper para clasificar eventos visualmente
function determineEventType(action) {
    const act = action.toUpperCase();
    if (act.includes('LOGIN') || act.includes('LOGOUT')) return 'security';
    if (act.includes('PRODUCTO') || act.includes('STOCK') || act.includes('INVENTARIO')) return 'inventory';
    if (act.includes('GUARDIA') || act.includes('USUARIO')) return 'personnel';
    return 'other';
}
