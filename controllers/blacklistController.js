const { Blacklist, Usuario, Auditoria } = require('../models');

// Crear un nuevo registro en la lista negra
exports.crear = async (req, res) => {
    try {
        const { nombre, rut, recintos, fecha_bloqueo, motivo, fecha_ingreso } = req.body;
        
        // Validar si ya existe
        const existente = await Blacklist.findOne({ where: { rut } });
        if (existente) {
            return res.status(400).send({ message: "Este RUT ya se encuentra en la lista negra." });
        }

        // Obtener usuario autenticado para auditoría
        let agregado_por = 'Sistema';
        let agregado_por_id = null;
        if (req.userId) {
            const usuario = await Usuario.findByPk(req.userId);
            if (usuario) {
                agregado_por = usuario.nombre || 'Sistema';
                agregado_por_id = usuario.id;
            }
        }

        if (!agregado_por) {
            return res.status(400).send({ message: "Campo agregado_por es requerido." });
        }

        const registro = await Blacklist.create({
            nombre,
            rut,
            recintos,
            fecha_bloqueo,
            motivo,
            fecha_ingreso,
            agregado_por,
            agregado_por_id
        });

        // Log de auditoría
        try {
            await Auditoria.create({
                usuario_id: agregado_por_id,
                objetivo_id: registro.id,
                accion: 'BLACKLIST_ADD',
                detalles: JSON.stringify({ rut, nombre, agregado_por })
            });
        } catch (e) {
            // No bloquear por fallo de auditoría
            console.warn('Audit log failed for BLACKLIST_ADD:', e.message);
        }

        res.status(201).send(registro);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Listar todos los registros
exports.buscarTodos = async (req, res) => {
    try {
        const registros = await Blacklist.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(registros);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar un registro
exports.actualizar = async (req, res) => {
    try {
        const id = req.params.id;
        const [actualizado] = await Blacklist.update(req.body, {
            where: { id: id }
        });

        if (actualizado) {
            const registroActualizado = await Blacklist.findByPk(id);
            res.status(200).send(registroActualizado);
        } else {
            res.status(404).send({ message: "Registro no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar un registro (desbloquear)
exports.eliminar = async (req, res) => {
    try {
        const id = req.params.id;
        const eliminado = await Blacklist.destroy({
            where: { id: id }
        });

        if (eliminado) {
            // Auditoría de eliminación
            try {
                await Auditoria.create({
                    usuario_id: req.userId || null,
                    objetivo_id: id,
                    accion: 'BLACKLIST_DELETE',
                    detalles: JSON.stringify({ id })
                });
            } catch (e) {
                console.warn('Audit log failed for BLACKLIST_DELETE:', e.message);
            }
            res.status(204).send();
        } else {
            res.status(404).send({ message: "Registro no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
