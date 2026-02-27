const { Usuario, Rol, Permiso, Auditoria, Region, sequelize } = require('../models');
const { Op } = require('sequelize');

const audit = (uid, oid, acc, det, t) => Auditoria.create({ usuario_id: uid, objetivo_id: oid, accion: acc, detalles: JSON.stringify(det) }, { transaction: t });

/**
 * NOMBRE: Crear Usuario
 * FUNCIÓN: Registra un nuevo usuario en el sistema con sus roles y regiones asignadas.
 * USO: POST /usuarios - Retorna mensaje de éxito y objeto usuario.
 * -----------------------------------------------------------------------
 * Realiza una transacción para crear usuario, asignar regiones y registrar auditoría.
 */
exports.crear = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, email, password, rol_id, regiones } = req.body;
        const usuario = await Usuario.create({ nombre, email, password, rol_id, estado: true }, { transaction: t });
        if (regiones?.length) await usuario.setRegions(regiones, { transaction: t });

        await audit(req.userId, usuario.id, 'CREAR_USUARIO', { nombre, email, rol_id }, t);
        await t.commit();
        res.status(201).send({ message: "¡Usuario registrado!", usuario });
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Listar Usuarios
 * FUNCIÓN: Obtiene una lista paginada de usuarios con filtros por búsqueda, rol y estado.
 * USO: GET /usuarios - Retorna objeto con totalItems, totalPages, currentPage y usuarios.
 * -----------------------------------------------------------------------
 * Soporta búsqueda parcial (LIKE) en nombre/email y paginación estándar.
 */
exports.buscarTodos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, rol_id, estado } = req.query;
        const where = {};
        if (search) where[Op.or] = [{ nombre: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];
        if (rol_id) where.rol_id = rol_id;
        if (estado !== undefined) where.estado = estado === 'true';

        const { count, rows } = await Usuario.findAndCountAll({
            where, include: [Rol, { model: Permiso }, { model: Region }],
            distinct: true, limit: +limit, offset: (page - 1) * limit, order: [['nombre', 'ASC']]
        });
        res.status(200).send({ totalItems: count, totalPages: Math.ceil(count / limit), currentPage: +page, usuarios: rows });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Obtener Usuario
 * FUNCIÓN: Busca un usuario específico por su ID incluyendo relaciones.
 * USO: GET /usuarios/:id - Retorna objeto usuario o 404.
 * -----------------------------------------------------------------------
 * Incluye Rol, Permisos y Regiones asociadas en la respuesta.
 */
exports.buscarUno = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, { include: [Rol, Permiso, Region] });
        usuario ? res.status(200).send(usuario) : res.status(404).send({ message: "Usuario no encontrado." });
    } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Actualizar Usuario
 * FUNCIÓN: Modifica los datos de un usuario existente (nombre, email, rol, regiones).
 * USO: PUT /usuarios/:id - Retorna usuario actualizado.
 * -----------------------------------------------------------------------
 * Registra auditoría con los valores anteriores y nuevos si hubo cambios.
 */
exports.actualizar = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, email, rol_id, regiones } = req.body;
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) { await t.rollback(); return res.status(404).send({ message: "Usuario no encontrado." }); }

        const old = { nombre: usuario.nombre, email: usuario.email, rol_id: usuario.rol_id };
        await usuario.update({ nombre, email, rol_id }, { transaction: t });
        if (regiones !== undefined) await usuario.setRegions(regiones, { transaction: t });

        await audit(req.userId, usuario.id, 'ACTUALIZAR_USUARIO', { anterior: old, nuevo: { nombre, email, rol_id } }, t);
        await t.commit();
        res.status(200).send(usuario);
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Cambiar Estado
 * FUNCIÓN: Activa o desactiva un usuario.
 * USO: PATCH /usuarios/:id/estado - Retorna mensaje de confirmación.
 * -----------------------------------------------------------------------
 * Actualiza solo el campo booleano 'estado' y registra la acción.
 */
exports.cambiarEstado = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) { await t.rollback(); return res.status(404).send({ message: "Usuario no encontrado." }); }

        await usuario.update({ estado: req.body.estado }, { transaction: t });
        await audit(req.userId, usuario.id, 'CAMBIAR_ESTADO', { nuevo_estado: req.body.estado }, t);
        await t.commit();
        res.status(200).send({ message: `Usuario ${req.body.estado ? 'activado' : 'desactivado'}.` });
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Eliminar Usuario
 * FUNCIÓN: Elimina permanentemente un usuario de la base de datos.
 * USO: DELETE /usuarios/:id - Retorna 204 No Content.
 * -----------------------------------------------------------------------
 * Acción destructiva protegida por transacción y auditoría previa.
 */
exports.eliminar = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) { await t.rollback(); return res.status(404).send({ message: "Usuario no encontrado." }); }

        await audit(req.userId, usuario.id, 'ELIMINAR_USUARIO', { nombre: usuario.nombre }, t);
        await usuario.destroy({ transaction: t });
        await t.commit();
        res.status(204).send();
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Cambiar Contraseña Perfil
 * FUNCIÓN: Permite al usuario logueado cambiar su propia contraseña.
 * USO: POST /perfil/password - Retorna mensaje de éxito.
 * -----------------------------------------------------------------------
 * Verifica contraseña actual antes de permitir el cambio.
 */
exports.cambiarPasswordPerfil = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { currentPassword, newPassword } = req.body;
        const usuario = await Usuario.findByPk(req.userId);
        
        if (!usuario || usuario.password !== currentPassword || usuario.password === newPassword) {
            await t.rollback();
            return res.status(400).send({ message: "Datos inválidos o contraseña repetida." });
        }

        usuario.password = newPassword;
        await usuario.save({ transaction: t });
        await audit(req.userId, usuario.id, 'CAMBIAR_PASSWORD', { mensaje: 'Cambio contraseña perfil' }, t);
        await t.commit();
        res.status(200).send({ message: "Contraseña actualizada." });
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Gestionar Permisos
 * FUNCIÓN: Asigna permisos directos a un usuario (override de roles).
 * USO: POST /usuarios/:id/permisos - Retorna mensaje de éxito.
 * -----------------------------------------------------------------------
 * Deprecated: Generalmente se maneja vía Roles, pero se mantiene para excepciones.
 */
exports.gestionarPermisos = async (req, res) => { 
    const t = await sequelize.transaction();
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) { await t.rollback(); return res.status(404).send({ message: "Usuario no encontrado." }); }

        await usuario.setPermisos(req.body.permisos, { transaction: t });
        await audit(req.userId, usuario.id, 'MODIFICAR_PERMISOS', { permisos: req.body.permisos }, t);
        await t.commit();
        res.status(200).send({ message: "Permisos actualizados." });
    } catch (e) { await t.rollback(); res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Obtener Roles
 * FUNCIÓN: Lista todos los roles disponibles en el sistema.
 * USO: GET /roles - Retorna array de roles.
 * -----------------------------------------------------------------------
 * Utilizado para selectores en formularios de creación/edición.
 */
exports.obtenerRoles = async (req, res) => {
    try { res.status(200).send(await Rol.findAll()); } catch (e) { res.status(500).send({ message: e.message }); }
};

/**
 * NOMBRE: Obtener Permisos
 * FUNCIÓN: Lista todos los permisos del sistema.
 * USO: GET /permisos - Retorna array de permisos.
 * -----------------------------------------------------------------------
 * Utilizado para la gestión granular de accesos.
 */
exports.obtenerPermisos = async (req, res) => {
    try { res.status(200).send(await Permiso.findAll()); } catch (e) { res.status(500).send({ message: e.message }); }
};
