const jwt = require('jsonwebtoken');
const { Usuario, Guardia, Rol } = require('../models');

// Inicio de Sesión Web (Administradores)
exports.iniciarSesionWeb = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({
            where: { email: email },
            include: Rol
        });

        if (!usuario) {
            return res.status(404).send({ message: "Usuario no encontrado." });
        }

        if (!usuario.estado) {
             return res.status(401).send({ message: "Usuario inactivo." });
        }

        // Comparación directa de contraseñas (sin encriptar)
        const passwordEsValido = (password === usuario.password);

        if (!passwordEsValido) {
            return res.status(401).send({
                accessToken: null,
                message: "¡Contraseña Inválida!"
            });
        }

        const token = jwt.sign({ id: usuario.id, role: usuario.Rol ? usuario.Rol.nombre : null, type: 'usuario' }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        res.status(200).send({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            roles: usuario.Rol ? usuario.Rol.nombre : null,
            accessToken: token
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Inicio de Sesión App (Guardias)
exports.iniciarSesionApp = async (req, res) => {
    try {
        const { rut, password } = req.body;

        const guardia = await Guardia.findOne({
            where: { rut: rut }
        });

        if (!guardia) {
            return res.status(404).send({ message: "Guardia no encontrado." });
        }

        if (!guardia.activo_app) {
             return res.status(401).send({ message: "Acceso a App no habilitado." });
        }

        // Verificar contraseña si está configurada
        if (!guardia.password) {
            return res.status(401).send({ message: "Contraseña no configurada." });
        }

        // Comparación directa de contraseñas (sin encriptar)
        const passwordEsValido = (password === guardia.password);

        if (!passwordEsValido) {
            return res.status(401).send({
                accessToken: null,
                message: "¡Contraseña Inválida!"
            });
        }

        // Actualizar Último Acceso
        guardia.ultimo_acceso = new Date();
        await guardia.save();

        const token = jwt.sign({ id: guardia.id, role: 'Guardia', type: 'guardia' }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 horas
        });

        res.status(200).send({
            id: guardia.id,
            nombre: guardia.nombre,
            rut: guardia.rut,
            accessToken: token
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
