const { Usuario, Rol } = require('../models');

exports.crear = async (req, res) => {
    try {
        const { nombre, email, password, rol_id } = req.body;
        
        // Se guarda la contraseña sin encriptar
        const usuario = await Usuario.create({
            nombre,
            email,
            password: password,
            rol_id
        });

        res.status(201).send({ message: "¡Usuario registrado exitosamente!" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.buscarTodos = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: Rol,
            // attributes: { exclude: ['password'] } // Permitir ver todo
        });
        res.status(200).send(usuarios);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.buscarUno = async (req, res) => {
    try {
        const id = req.params.id;
        const usuario = await Usuario.findByPk(id, {
             include: Rol,
             // attributes: { exclude: ['password'] } // Permitir ver todo
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
    try {
        const id = req.params.id;
        // La contraseña se actualiza tal cual viene, sin encriptar
        
        const [actualizado] = await Usuario.update(req.body, {
            where: { id: id }
        });

        if (actualizado) {
            // Permitir ver todo al devolver el usuario actualizado
            const usuarioActualizado = await Usuario.findByPk(id); 
            res.status(200).send(usuarioActualizado);
        } else {
            res.status(404).send({ message: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const id = req.params.id;
        const eliminado = await Usuario.destroy({
            where: { id: id }
        });

        if (eliminado) {
            res.status(204).send();
        } else {
            res.status(404).send({ message: "Usuario no encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
