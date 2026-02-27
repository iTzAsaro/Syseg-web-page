const { Bitacora, Usuario } = require('../models');
const { Op } = require('sequelize');

const getAutor = async (uid) => (uid ? (await Usuario.findByPk(uid))?.nombre : 'Sistema') || 'Sistema';

/**
 * NOMBRE: Crear Registro Bitácora
 * FUNCIÓN: Registra evento con IP y validaciones.
 * USO: POST /bitacora - Retorna registro creado.
 * -----------------------------------------------------------------------
 * Normaliza IP y establece valores por defecto.
 */
exports.create = async (req, res) => {
    try {
        const { accion, descripcion, categoria, prioridad, nivel, fecha } = req.body;
        if (!accion) return res.status(400).send({ message: "Acción obligatoria." });

        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '127.0.0.1';

        const nueva = await Bitacora.create({
            usuario_id: req.userId,
            autor: await getAutor(req.userId),
            accion,
            descripcion: descripcion || '',
            categoria: categoria || 'Rutina',
            prioridad: prioridad || nivel || 'Baja',
            nivel: nivel || prioridad || 'Baja',
            ip_address: ip,
            ...(fecha && { fecha })
        });
        res.status(201).send(nueva);
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Listar Bitácoras
 * FUNCIÓN: Busca registros con filtros múltiples.
 * USO: GET /bitacora - Retorna paginación.
 * -----------------------------------------------------------------------
 * Permisos: Admin ve todo, Usuario solo lo suyo.
 */
exports.buscarTodos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, nivel, fechaInicio, fechaFin, usuarioId, categoria, accion } = req.query;
        const u = await Usuario.findByPk(req.userId);
        const esAdmin = req.userRole === 'Admin' || req.userRole === 1 || u?.rol_id === 1;

        const where = esAdmin ? {} : { usuario_id: req.userId };
        if (esAdmin && usuarioId) where.usuario_id = usuarioId;
        if (categoria && categoria !== 'Todos') where.categoria = categoria;
        if (accion) where.accion = { [Op.like]: `%${accion}%` };
        if (nivel && nivel !== 'Todos') where.nivel = nivel;
        if (fechaInicio || fechaFin) where.fecha = { ...(fechaInicio && { [Op.gte]: fechaInicio }), ...(fechaFin && { [Op.lte]: new Date(new Date(fechaFin).setHours(23, 59, 59)) }) };
        
        if (search) {
            where[Op.and] = (where[Op.and] || []).concat([{
                [Op.or]: ['autor', 'accion', 'descripcion', 'categoria'].map(f => ({ [f]: { [Op.like]: `%${search}%` } }))
            }]);
        }

        const { count, rows } = await Bitacora.findAndCountAll({
            where, limit: +limit, offset: (+page - 1) * +limit,
            order: [['fecha', 'DESC']],
            include: [{ model: Usuario, attributes: ['nombre', 'email', 'rol_id'] }]
        });
        res.send({ totalItems: count, totalPages: Math.ceil(count / limit), currentPage: +page, bitacoras: rows });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Actualizar Registro
 * FUNCIÓN: Modifica evento existente.
 * USO: PUT /bitacora/:id - Retorna actualizado.
 * -----------------------------------------------------------------------
 * Solo el propietario puede editar.
 */
exports.update = async (req, res) => {
    try {
        const log = await Bitacora.findByPk(req.params.id);
        if (!log) return res.status(404).send({ message: "No encontrado." });
        if (log.usuario_id !== req.userId) return res.status(403).send({ message: "Sin permiso." });

        await log.update(req.body);
        res.send({ message: "Actualizado.", log });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Eliminar Registro
 * FUNCIÓN: Borra evento permanentemente.
 * USO: DELETE /bitacora/:id - Retorna éxito.
 * -----------------------------------------------------------------------
 * Solo el propietario puede eliminar.
 */
exports.delete = async (req, res) => {
    try {
        const log = await Bitacora.findByPk(req.params.id);
        if (!log) return res.status(404).send({ message: "No encontrado." });
        if (log.usuario_id !== req.userId) return res.status(403).send({ message: "Sin permiso." });

        await log.destroy();
        res.send({ message: "Eliminado." });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

exports.logInterno = async (uid, accion, descripcion, nivel = 'Informativa', ip = null) => {
    try {
        await Bitacora.create({
            usuario_id: uid,
            autor: await getAutor(uid),
            accion, descripcion, categoria: 'Sistema', prioridad: 'Media', nivel, ip_address: ip
        });
    } catch (e) { console.error('Log interno error:', e); }
};
