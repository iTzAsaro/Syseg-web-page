const { Bitacora, Usuario } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo registro en bitácora
exports.create = async (req, res) => {
    try {
        const { accion, detalles, nivel, ip_address } = req.body;
        
        // El usuario viene del middleware de autenticación (verifyToken)
        const usuario_id = req.userId; 
        
        // Obtener nombre del usuario si está disponible
        let autor = 'Sistema';
        if (usuario_id) {
            const user = await Usuario.findByPk(usuario_id);
            if (user) autor = user.nombre;
        }

        const bitacora = await Bitacora.create({
            usuario_id,
            autor,
            accion,
            detalles,
            nivel,
            ip_address
        });

        res.status(201).send(bitacora);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error al crear registro de bitácora."
        });
    }
};

// Obtener registros con filtros y paginación
exports.buscarTodos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, nivel, fechaInicio, fechaFin } = req.query;
        const offset = (page - 1) * limit;
        
        let condition = {};

        // Filtro por búsqueda (autor, acción o detalles)
        if (search) {
            condition[Op.or] = [
                { autor: { [Op.like]: `%${search}%` } },
                { accion: { [Op.like]: `%${search}%` } },
                { detalles: { [Op.like]: `%${search}%` } }
            ];
        }

        // Filtro por nivel
        if (nivel && nivel !== 'Todos') {
            condition.nivel = nivel;
        }

        // Filtro por rango de fechas
        if (fechaInicio || fechaFin) {
            condition.fecha = {};
            if (fechaInicio) condition.fecha[Op.gte] = new Date(fechaInicio);
            if (fechaFin) condition.fecha[Op.lte] = new Date(new Date(fechaFin).setHours(23, 59, 59));
        }

        const { count, rows } = await Bitacora.findAndCountAll({
            where: condition,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']],
            include: [{
                model: Usuario,
                attributes: ['nombre', 'email', 'rol_id'] // No enviar password
            }]
        });

        res.send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            bitacoras: rows
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Error al obtener bitácora."
        });
    }
};

// Método interno para usar desde otros controladores (sin req, res)
exports.logInterno = async (usuario_id, accion, detalles, nivel = 'Informativa', ip = null) => {
    try {
        let autor = 'Sistema';
        if (usuario_id) {
            const user = await Usuario.findByPk(usuario_id);
            if (user) autor = user.nombre;
        }

        await Bitacora.create({
            usuario_id,
            autor,
            accion,
            detalles,
            nivel,
            ip_address: ip
        });
    } catch (error) {
        console.error('Error al crear log interno:', error);
    }
};
