const { Op, Sequelize } = require('sequelize');
const { MovimientoInventario, Producto, Categoria, Bitacora, Usuario, Rol, Guardia } = require('../models');
const sequelize = require('../config/database');

/**
 * Obtener resumen operativo (KPIs) para el dashboard principal
 */
exports.getResumenOperativo = async (req, res) => {
    try {
        // 1. Total Artículos
        const totalProductos = await Producto.count();

        // 2. Guardias Activos (Habilitados App)
        const guardiasActivos = await Guardia.count({ where: { activo_app: true } });

        // 3. Stock Crítico (Actual <= Mínimo)
        const stockCritico = await Producto.count({
            where: {
                stock_actual: {
                    [Op.lte]: sequelize.col('stock_minimo')
                }
            }
        });

        // 4. Retiros Hoy (Salidas con fecha >= inicio de hoy)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const retirosHoy = await MovimientoInventario.count({
            where: {
                cantidad: { [Op.lt]: 0 }, // Salidas (cantidad negativa)
                fecha_hora: { [Op.gte]: startOfDay }
            }
        });

        res.status(200).send({
            totalProductos,
            guardiasActivos,
            stockCritico,
            retirosHoy
        });
    } catch (error) {
        console.error("Error obteniendo resumen operativo:", error);
        res.status(500).send({ message: error.message });
    }
};

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

        // 3. Top Usuarios (Más retiros)
        const topUsersQuery = await MovimientoInventario.findAll({
            where: {
                cantidad: { [Op.lt]: 0 } // Solo salidas
            },
            attributes: [
                'usuario_id',
                [sequelize.fn('SUM', sequelize.literal('ABS(cantidad)')), 'total_retirado'],
                [sequelize.fn('COUNT', sequelize.col('MovimientoInventario.id')), 'total_movimientos']
            ],
            include: [{
                model: Usuario,
                attributes: ['nombre', 'email'],
                include: [{
                    model: Rol,
                    attributes: ['nombre']
                }]
            }],
            group: ['usuario_id', 'Usuario.id', 'Usuario.nombre', 'Usuario.email', 'Usuario->Rol.id', 'Usuario->Rol.nombre'],
            order: [[sequelize.literal('total_retirado'), 'DESC']],
            limit: 5
        });

        const topUsers = topUsersQuery.map(u => ({
            name: u.Usuario ? u.Usuario.nombre : 'Usuario Eliminado',
            role: u.Usuario && u.Usuario.Rol ? u.Usuario.Rol.nombre : 'Desconocido',
            count: parseInt(u.get('total_retirado')),
            transactions: parseInt(u.get('total_movimientos'))
        }));

        res.json({
            activityData,
            topItems,
            topUsers
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
