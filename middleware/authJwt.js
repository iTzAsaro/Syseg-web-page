const jwt = require('jsonwebtoken');
const { Usuario, Permiso } = require('../models');

/**
 * NOMBRE: Verificar Token JWT
 * FUNCIÓN: Valida la presencia y autenticidad del token Bearer en los headers.
 * USO: Middleware global en rutas protegidas - Inyecta userId, userRole, userType en req.
 * -----------------------------------------------------------------------
 * Decodifica el token usando JWT_SECRET y rechaza peticiones sin formato Bearer correcto.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).send({ message: '¡No se ha proporcionado token!' });

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).send({ message: 'Formato inválido. Use: Bearer <token>' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: '¡No autorizado!' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userType = decoded.type;
        next();
    });
};

/**
 * NOMBRE: Verificar Rol Administrador
 * FUNCIÓN: Restringe el acceso únicamente a usuarios con rol de Administrador.
 * USO: Middleware tras verifyToken - Permite paso solo si userRole es 1 o 'Admin'.
 * -----------------------------------------------------------------------
 * Verifica tanto el ID numérico (1) como el string 'Admin' para compatibilidad.
 */
const isAdmin = (req, res, next) => {
    if (req.userRole === 1 || req.userRole === 'Admin') return next();
    res.status(403).send({ message: '¡Se requiere rol de Administrador!', role: req.userRole });
};

/**
 * NOMBRE: Verificar Permiso Granular
 * FUNCIÓN: Valida si el usuario tiene asignado un permiso específico por código.
 * USO: hasPermission('CODIGO_PERMISO') - Middleware dinámico.
 * -----------------------------------------------------------------------
 * Los Admins (Rol 1) tienen acceso total (bypass). Los guardias no tienen permisos granulares.
 */
const hasPermission = (permisoRequerido) => async (req, res, next) => {
    try {
        if (req.userType === 'guardia') return res.status(403).send({ message: "Acción no permitida para guardias." });

        const usuario = await Usuario.findByPk(req.userId, {
            include: [{ model: Permiso, attributes: ['codigo'], through: { attributes: [] } }]
        });

        if (!usuario) return res.status(404).send({ message: "Usuario no encontrado." });
        if (usuario.rol_id === 1 || usuario.Permisos.some(p => p.codigo === permisoRequerido)) return next();

        res.status(403).send({ message: `Requiere permiso: ${permisoRequerido}` });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
};

module.exports = { verifyToken, isAdmin, hasPermission };
