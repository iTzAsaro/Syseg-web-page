const { Op } = require('sequelize');
const { MovimientoInventario, Producto, Categoria, Usuario, Rol, Guardia } = require('../models');
const sequelize = require('../config/database');

/**
 * ================================================================================================
 * NOMBRE: Resumen Operativo (KPIs)
 * FUNCIÓN: Obtiene métricas clave para el dashboard principal (productos, guardias, stock crítico, retiros).
 * USO: GET /reportes/resumen - Retorna objeto JSON con contadores.
 * -----------------------------------------------------------------------
 * Calcula retiros del día usando fecha actual (00:00) y stock crítico comparando actual vs mínimo.
 * ================================================================================================
 */
exports.getResumenOperativo = async (req, res) => {
    try {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        
        const [totalProductos, guardiasActivos, totalGuardias, stockCritico, retirosHoy] = await Promise.all([
            Producto.count(),
            Guardia.count({ where: { activo_app: true } }),
            Guardia.count(),
            Producto.count({ where: { stock_actual: { [Op.lte]: sequelize.col('stock_minimo') } } }),
            MovimientoInventario.count({ where: { cantidad: { [Op.lt]: 0 }, fecha_hora: { [Op.gte]: startOfDay } } })
        ]);

        res.status(200).send({ totalProductos, guardiasActivos, totalGuardias, stockCritico, retirosHoy });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Estadísticas Dashboard
 * FUNCIÓN: Genera datos para gráficos: actividad semanal, top productos y top usuarios.
 * USO: GET /reportes/stats - Retorna JSON con activityData, topItems y topUsers.
 * -----------------------------------------------------------------------
 * Realiza agregaciones complejas (SUM, COUNT) agrupando por fechas, productos y usuarios.
 * ================================================================================================
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        // 1. Actividad Semanal
        const movimientosSemana = await MovimientoInventario.findAll({
            where: { fecha_hora: { [Op.between]: [startOfWeek, endOfWeek] } },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('fecha_hora')), 'fecha'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END")), 'ingresos'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN cantidad < 0 THEN ABS(cantidad) ELSE 0 END")), 'retiros']
            ],
            group: [sequelize.fn('DATE', sequelize.col('fecha_hora'))]
        });

        const activityData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek); d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const mov = movimientosSemana.find(m => m.get('fecha') === dateStr);
            return {
                day: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i],
                ingresos: mov ? parseInt(mov.get('ingresos')) : 0,
                retiros: mov ? parseInt(mov.get('retiros')) : 0,
                rawDate: dateStr
            };
        });

        // 2. Top Productos (Salidas)
        const topProductos = await MovimientoInventario.findAll({
            where: { cantidad: { [Op.lt]: 0 }, fecha_hora: { [Op.between]: [startOfMonth, endOfMonth] } },
            attributes: ['producto_id', [sequelize.fn('SUM', sequelize.literal('ABS(cantidad)')), 'total_salidas']],
            include: [{ model: Producto, attributes: ['nombre'], include: [{ model: Categoria, attributes: ['nombre'] }] }],
            group: ['producto_id', 'Producto.id', 'Producto.nombre', 'Producto.Categoria.id', 'Producto.Categoria.nombre'], // Adjusted group by for reliability
            order: [[sequelize.literal('total_salidas'), 'DESC']], limit: 5
        });

        const topItems = topProductos.map(item => ({
            name: item.Producto.nombre,
            cat: item.Producto.Categoria?.nombre || 'General',
            count: parseInt(item.get('total_salidas')),
            max: 0 // Frontend handle max
        }));
        if (topItems.length) {
            const max = Math.max(...topItems.map(i => i.count));
            topItems.forEach(i => i.max = max * 1.2);
        }

        // 3. Top Usuarios
        const topUsersQuery = await MovimientoInventario.findAll({
            where: { cantidad: { [Op.lt]: 0 }, fecha_hora: { [Op.between]: [startOfMonth, endOfMonth] } },
            attributes: ['usuario_id', [sequelize.fn('SUM', sequelize.literal('ABS(cantidad)')), 'total_retirado'], [sequelize.fn('COUNT', sequelize.col('MovimientoInventario.id')), 'total_movimientos']],
            include: [{ model: Usuario, attributes: ['nombre'], include: [{ model: Rol, attributes: ['nombre'] }] }],
            group: ['usuario_id', 'Usuario.id', 'Usuario.nombre', 'Usuario.Rol.id', 'Usuario.Rol.nombre'], // Adjusted group by
            order: [[sequelize.literal('total_retirado'), 'DESC']], limit: 5
        });

        const topUsers = topUsersQuery.map(u => ({
            name: u.Usuario?.nombre || 'Usuario Eliminado',
            role: u.Usuario?.Rol?.nombre || 'Desconocido',
            count: parseInt(u.get('total_retirado')),
            transactions: parseInt(u.get('total_movimientos'))
        }));

        res.json({ activityData, topItems, topUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
