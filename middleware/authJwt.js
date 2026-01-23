const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({
            message: '¡No se ha proporcionado token!'
        });
    }

    // Bearer <token>
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
         return res.status(401).send({
            message: '¡No autorizado! El formato es Bearer <token>'
        });
    }

    jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: '¡No autorizado!'
            });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userType = decoded.type; // 'usuario' or 'guardia'
        next();
    });
};

const isAdmin = (req, res, next) => {
    // Check if role allows admin access (Simplification: Role name 'Admin')
    if (req.userRole === 'Admin' || req.userRole === 1) { 
        next();
        return;
    }
    res.status(403).send({
        message: '¡Se requiere rol de Administrador!'
    });
};

module.exports = {
    verifyToken,
    isAdmin
};
