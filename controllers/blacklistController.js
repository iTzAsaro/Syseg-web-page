const { Blacklist } = require('../models');

// Crear un nuevo registro en la lista negra
exports.crear = async (req, res) => {
    try {
        const { nombre, rut, recintos, fecha_bloqueo, motivo, evidencia_url } = req.body;
        
        // Validar si ya existe
        const existente = await Blacklist.findOne({ where: { rut } });
        if (existente) {
            return res.status(400).send({ message: "Este RUT ya se encuentra en la lista negra." });
        }

        const registro = await Blacklist.create({
            nombre,
            rut,
            recintos,
            fecha_bloqueo,
            motivo,
            evidencia_url
        });

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
            res.status(204).send();
        } else {
            res.status(404).send({ message: "Registro no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
