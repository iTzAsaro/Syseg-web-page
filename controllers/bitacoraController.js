const { Bitacora, Usuario } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo registro en bitácora
exports.create = async (req, res) => {
    try {
        const { accion, descripcion, categoria, prioridad, nivel, fecha } = req.body;
        
        // Detectar IP automáticamente
        let ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        // Normalizar IP local (IPv6 ::1 a IPv4 127.0.0.1)
        if (ip_address === '::1' || ip_address === '::ffff:127.0.0.1') {
            ip_address = '127.0.0.1';
        }

        console.log('Bitacora.create Payload recibido:', req.body);
        console.log('IP detectada:', ip_address);

        // Validación de campos obligatorios mínimos
        if (!accion) {
            return res.status(400).send({ message: "El campo 'accion' es obligatorio." });
        }

        // Lógica de asignación y validación de campos nuevos
        // 1. Prioridad: Si no viene, intentar deducir de 'nivel'. Si no, 'Baja'.
        let finalPrioridad = prioridad;
        if (!finalPrioridad) {
            if (nivel) finalPrioridad = nivel; // Mapeo directo si coinciden
            else finalPrioridad = 'Baja';
        }

        // 2. Categoría: Si no viene, 'Rutina'.
        let finalCategoria = categoria || 'Rutina';

        // 3. Descripción: Asegurar string vacío si es null
        let finalDescripcion = descripcion || '';

        // El usuario viene del middleware de autenticación (verifyToken)
        const usuario_id = req.userId; 
        
        // Obtener nombre del usuario si está disponible
        let autor = 'Sistema';
        if (usuario_id) {
            const user = await Usuario.findByPk(usuario_id);
            if (user) autor = user.nombre;
        }

        const bitacoraData = {
            usuario_id,
            autor,
            accion,
            descripcion: finalDescripcion,
            categoria: finalCategoria,
            prioridad: finalPrioridad,
            nivel: nivel || finalPrioridad, // Asegurar que nivel también tenga valor
            ip_address
        };

        // Si se proporciona fecha, usarla; si no, dejar que Sequelize use defaultValue (NOW)
        if (fecha) {
            bitacoraData.fecha = fecha;
        }

        console.log('Guardando en DB:', bitacoraData);

        const bitacora = await Bitacora.create(bitacoraData);

        res.status(201).send(bitacora);
    } catch (error) {
        console.error('Error en Bitacora.create:', error);
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
        const usuario_id = req.userId; // ID del usuario autenticado
        
        // Filtro base: Solo mostrar bitácoras del usuario autenticado
        let condition = { usuario_id };

        // Filtro por búsqueda (autor, acción, descripcion o categoria)
        if (search) {
            condition[Op.and] = [
                { usuario_id },
                {
                    [Op.or]: [
                        { autor: { [Op.like]: `%${search}%` } },
                        { accion: { [Op.like]: `%${search}%` } },
                        { descripcion: { [Op.like]: `%${search}%` } },
                        { categoria: { [Op.like]: `%${search}%` } }
                    ]
                }
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

// Actualizar un registro de bitácora
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { accion, descripcion, categoria, prioridad, nivel, fecha } = req.body;
        const usuario_id = req.userId;

        const log = await Bitacora.findByPk(id);

        if (!log) {
            return res.status(404).send({ message: "Registro no encontrado." });
        }

        // Verificar permisos: Solo el propietario puede editar
        if (log.usuario_id !== usuario_id) {
            return res.status(403).send({ 
                message: "Acceso denegado. No tienes permiso para editar esta bitácora." 
            });
        }

        log.accion = accion || log.accion;
        log.descripcion = descripcion || log.descripcion;
        log.categoria = categoria || log.categoria;
        log.prioridad = prioridad || log.prioridad;
        log.nivel = nivel || log.nivel;
        if (fecha) log.fecha = fecha;
        
        await log.save();

        res.send({ message: "Registro actualizado exitosamente.", log });
    } catch (error) {
        res.status(500).send({
            message: "Error al actualizar registro de bitácora."
        });
    }
};

// Eliminar un registro de bitácora
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.userId; // ID del usuario autenticado

        const log = await Bitacora.findByPk(id);

        if (!log) {
            return res.status(404).send({ message: "Registro no encontrado." });
        }

        // Verificar permisos: Solo el propietario puede eliminar
        if (log.usuario_id !== usuario_id) {
            return res.status(403).send({ 
                message: "Acceso denegado. No tienes permiso para eliminar esta bitácora." 
            });
        }

        await log.destroy();

        res.send({ message: "Registro eliminado exitosamente." });
    } catch (error) {
        res.status(500).send({
            message: "Error al eliminar registro de bitácora."
        });
    }
};

// Método interno para usar desde otros controladores (sin req, res)
exports.logInterno = async (usuario_id, accion, descripcion, nivel = 'Informativa', ip = null) => {
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
            descripcion,
            categoria: 'Sistema',
            prioridad: 'Media',
            nivel,
            ip_address: ip
        });
    } catch (error) {
        console.error('Error al crear log interno:', error);
    }
};
