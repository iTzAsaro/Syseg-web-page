const { Usuario, Rol, Permiso, Auditoria, Region, UsuarioPermiso, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper para crear logs de auditoría
const logAudit = async (usuario_id, objetivo_id, accion, detalles, transaction) => {
    await Auditoria.create({
        usuario_id,
        objetivo_id,
        accion,
        detalles: JSON.stringify(detalles)
    }, { transaction });
};

exports.crear = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, email, password, rol_id, regiones } = req.body;
        
        const usuario = await Usuario.create({
            nombre,
            email,
            password,
            rol_id,
            estado: true
        }, { transaction: t });

        // Asignar regiones si se proporcionan (especialmente para Supervisores)
        if (regiones && regiones.length > 0) {
            await usuario.setRegions(regiones, { transaction: t });
        }

        await logAudit(req.userId, usuario.id, 'CREAR_USUARIO', { nombre, email, rol_id, regiones }, t);

        await t.commit();
        res.status(201).send({ message: "¡Usuario registrado exitosamente!", usuario });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.buscarTodos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, rol_id, estado } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (rol_id) where.rol_id = rol_id;
        if (estado !== undefined) where.estado = estado === 'true';

        const { count, rows } = await Usuario.findAndCountAll({
            where,
            include: [
                { model: Rol },
                { model: Permiso, through: { attributes: [] } }, // Incluir permisos
                { model: Region, through: { attributes: [] } } // Incluir regiones
            ],
            distinct: true,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nombre', 'ASC']]
        });

        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            usuarios: rows
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.cambiarPasswordPerfil = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.userId; // Obtenido del token
        const { currentPassword, newPassword } = req.body;

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        // Verificar contraseña actual
        if (usuario.password !== currentPassword) {
            await t.rollback();
            return res.status(400).send({ message: "La contraseña actual es incorrecta." });
        }

        // Verificar que la nueva contraseña sea diferente
        if (usuario.password === newPassword) {
            await t.rollback();
            return res.status(400).send({ message: "La nueva contraseña debe ser diferente a la actual." });
        }

        // Actualizar contraseña
        usuario.password = newPassword;
        await usuario.save({ transaction: t });

        // Registrar en auditoría (usar null si req.userId no está definido)
        const auditorId = req.userId || null;
        await logAudit(auditorId, id, 'CAMBIAR_PASSWORD_PERFIL', { mensaje: 'Usuario cambió su contraseña' }, t);

        await t.commit();
        res.status(200).send({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id = req.params.id;
        const usuario = await Usuario.findByPk(id, {
            include: [Rol, Permiso, Region]
        });

        if (usuario) {
            res.status(200).send(usuario);
        } else {
            res.status(404).send({ message: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.actualizar = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const { nombre, email, rol_id, regiones } = req.body; // No actualizamos password aquí por seguridad

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        const oldData = { nombre: usuario.nombre, email: usuario.email, rol_id: usuario.rol_id };
        
        await usuario.update({ nombre, email, rol_id }, { transaction: t });

        // Actualizar regiones
        if (regiones !== undefined) {
            await usuario.setRegions(regiones, { transaction: t });
        }

        if (JSON.stringify(oldData) !== JSON.stringify({ nombre, email, rol_id }) || regiones !== undefined) {
            await logAudit(req.userId, id, 'ACTUALIZAR_USUARIO', { anterior: oldData, nuevo: { nombre, email, rol_id, regiones } }, t);
        }

        await t.commit();
        res.status(200).send(usuario);
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.cambiarEstado = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const { estado } = req.body; // true or false

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        await usuario.update({ estado }, { transaction: t });
        await logAudit(req.userId, id, 'CAMBIAR_ESTADO', { estado_anterior: !estado, nuevo_estado: estado }, t);

        await t.commit();
        res.status(200).send({ message: `Usuario ${estado ? 'activado' : 'desactivado'} correctamente.` });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.gestionarPermisos = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const { permisos } = req.body; // Array de IDs de permisos

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        await usuario.setPermisos(permisos, { transaction: t });
        await logAudit(req.userId, id, 'MODIFICAR_PERMISOS', { permisos_asignados: permisos }, t);

        await t.commit();
        res.status(200).send({ message: "Permisos actualizados correctamente." });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.eliminar = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const usuario = await Usuario.findByPk(id);
        
        if (!usuario) {
            await t.rollback();
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        await logAudit(req.userId, id, 'ELIMINAR_USUARIO', { nombre: usuario.nombre, email: usuario.email }, t);
        await usuario.destroy({ transaction: t });

        await t.commit();
        res.status(204).send();
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.obtenerRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();
        res.status(200).send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.obtenerPermisos = async (req, res) => {
    try {
        const permisos = await Permiso.findAll();
        res.status(200).send(permisos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
