const jwt = require('jsonwebtoken');
const { Usuario, Guardia, Rol, Permiso } = require('../models');

// Inicio de Sesión Web (Administradores)
exports.iniciarSesionWeb = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({
            where: { email: email },
            include: [
                { model: Rol },
                { 
                    model: Permiso,
                    attributes: ['codigo'],
                    through: { attributes: [] }
                }
            ]
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

        const permisos = usuario.Permisos ? usuario.Permisos.map(p => p.codigo) : [];

        res.status(200).send({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            roles: usuario.Rol ? usuario.Rol.nombre : null,
            rol_id: usuario.rol_id,
            permisos: permisos,
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

// Verificar Token (Endpoint para validar sesión)
exports.verificarToken = async (req, res) => {
    try {
        if (req.userType === 'usuario') {
            const usuario = await Usuario.findByPk(req.userId, {
                include: [
                    { model: Rol },
                    { 
                        model: Permiso,
                        attributes: ['codigo'],
                        through: { attributes: [] }
                    }
                ],
                attributes: ['id', 'nombre', 'email', 'rol_id', 'estado']
            });
            
            if (!usuario || !usuario.estado) {
                return res.status(401).send({ message: "Usuario no encontrado o inactivo." });
            }

            const permisos = usuario.Permisos ? usuario.Permisos.map(p => p.codigo) : [];

            res.status(200).send({
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                roles: usuario.Rol ? usuario.Rol.nombre : null,
                permisos: permisos,
                type: 'usuario'
                // No devolvemos nuevo token, solo validamos el actual
            });
        } else if (req.userType === 'guardia') {
            const guardia = await Guardia.findByPk(req.userId, {
                attributes: ['id', 'nombre', 'rut', 'activo_app']
            });

            if (!guardia || !guardia.activo_app) {
                return res.status(401).send({ message: "Guardia no encontrado o inactivo." });
            }

            res.status(200).send({
                id: guardia.id,
                nombre: guardia.nombre,
                rut: guardia.rut,
                roles: 'Guardia',
                type: 'guardia'
            });
        } else {
            res.status(400).send({ message: "Tipo de usuario desconocido." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
