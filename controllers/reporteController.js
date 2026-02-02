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

        // 2. Guardias Activos (Habilitados App) y Total Guardias
        const guardiasActivos = await Guardia.count({ where: { activo_app: true } });
        const totalGuardias = await Guardia.count();

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
            totalGuardias,
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
        // 1. Actividad Semanal (Lunes a Domingo de la semana actual)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Dom) - 6 (Sab)
        const distanceToMonday = (dayOfWeek + 6) % 7; // Cuantos dias restar para llegar al Lunes
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - distanceToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const movimientosSemana = await MovimientoInventario.findAll({
            where: {
                fecha_hora: {
                    [Op.between]: [startOfWeek, endOfWeek]
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

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const activityData = [];
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            
            const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            const mov = movimientosSemana.find(m => m.get('fecha') === dateStr);
            
            activityData.push({
                day: days[i],
                ingresos: mov ? parseInt(mov.get('ingresos')) : 0,
                retiros: mov ? parseInt(mov.get('retiros')) : 0,
                rawDate: dateStr
            });
        }

        // 2. Top 5 Productos Más Solicitados (Mes Actual)
        // Definir inicio y fin del mes actual
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const topProductos = await MovimientoInventario.findAll({
            where: {
                cantidad: { [Op.lt]: 0 }, // Solo salidas
                fecha_hora: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
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

        // 3. Top Usuarios (Más retiros - Mes Actual)
        const topUsersQuery = await MovimientoInventario.findAll({
            where: {
                cantidad: { [Op.lt]: 0 }, // Solo salidas
                fecha_hora: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
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
