const { Guardia, Afp, SistemaSalud, Comuna } = require('../models');

exports.crear = async (req, res) => {
    try {
        // La contraseña se guarda tal cual viene, sin encriptar
        const guardia = await Guardia.create(req.body);
        res.status(201).send(guardia);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.buscarTodos = async (req, res) => {
    try {
        const guardias = await Guardia.findAll({
            include: [
                { model: Afp },
                { model: SistemaSalud },
                { model: Comuna }
            ],
            // attributes: { exclude: ['password'] } // Permitir ver todo
        });
        res.status(200).send(guardias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id = req.params.id;
        const guardia = await Guardia.findByPk(id, {
            include: [Afp, SistemaSalud, Comuna],
            // attributes: { exclude: ['password'] } // Permitir ver todo
        });

        if (guardia) {
            res.status(200).send(guardia);
        } else {
            res.status(404).send({ message: "Guardia no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const id = req.params.id;
        // La contraseña se actualiza tal cual viene, sin encriptar
        
        const [actualizado] = await Guardia.update(req.body, {
            where: { id: id }
        });

        if (actualizado) {
            // Permitir ver todo al devolver el guardia actualizado
            const guardiaActualizado = await Guardia.findByPk(id);
            res.status(200).send(guardiaActualizado);
        } else {
            res.status(404).send({ message: "Guardia no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const id = req.params.id;
        const eliminado = await Guardia.destroy({
            where: { id: id }
        });

        if (eliminado) {
            res.status(204).send();
        } else {
            res.status(404).send({ message: "Guardia no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
