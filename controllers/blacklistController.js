const { Blacklist, Usuario, Auditoria } = require('../models');

/**
 * NOMBRE: Agregar a Lista Negra
 * FUNCIÓN: Registra un RUT en la lista negra para restringir acceso.
 * USO: POST /blacklist - Retorna registro creado.
 * -----------------------------------------------------------------------
 * Verifica existencia previa y registra auditoría automáticamente.
 */
exports.crear = async (req, res) => {
    try {
        const { rut } = req.body;
        if (await Blacklist.count({ where: { rut } })) return res.status(400).send({ message: "RUT ya en lista negra." });

        const usuario = req.userId ? await Usuario.findByPk(req.userId) : null;
        const nuevo = await Blacklist.create({ ...req.body, agregado_por: usuario?.nombre || 'Sistema', agregado_por_id: usuario?.id });
        
        await safeAudit(usuario?.id, nuevo.id, 'BLACKLIST_ADD', req.body);
        res.status(201).send(nuevo);
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Listar Bloqueados
 * FUNCIÓN: Obtiene todos los registros activos en lista negra.
 * USO: GET /blacklist - Retorna lista ordenada por fecha.
 * -----------------------------------------------------------------------
 * Orden descendente por creación.
 */
exports.buscarTodos = async (req, res) => {
    try {
        res.send(await Blacklist.findAll({ order: [['createdAt', 'DESC']] }));
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Actualizar Bloqueo
 * FUNCIÓN: Modifica datos de un registro en lista negra.
 * USO: PUT /blacklist/:id - Retorna registro actualizado.
 * -----------------------------------------------------------------------
 * Devuelve 404 si el registro no existe.
 */
exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Blacklist.update(req.body, { where: { id } });
        updated ? res.send(await Blacklist.findByPk(id)) : res.status(404).send({ message: "No encontrado." });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Eliminar Bloqueo
 * FUNCIÓN: Remueve un registro de la lista negra.
 * USO: DELETE /blacklist/:id - Retorna 204 No Content.
 * -----------------------------------------------------------------------
 * Registra auditoría antes de eliminar.
 */
exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        if (!await Blacklist.destroy({ where: { id } })) return res.status(404).send({ message: "No encontrado." });
        
        await safeAudit(req.userId, id, 'BLACKLIST_DELETE', { id });
        res.status(204).send();
    } catch (e) { res.status(500).send({ message: e.message }); }
};

const safeAudit = async (uid, oid, action, details) => {
    try { await Auditoria.create({ usuario_id: uid, objetivo_id: oid, accion: action, detalles: JSON.stringify(details) }); }
    catch (e) { console.warn(`Audit error (${action}):`, e.message); }
};
