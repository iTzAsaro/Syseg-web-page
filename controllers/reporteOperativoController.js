const { ReporteOperativo } = require('../models');

/**
 * ================================================================================================
 * NOMBRE: Crear Reporte Operativo
 * FUNCIÓN: Registra un nuevo incidente o evento operativo detectando automáticamente el tipo de usuario.
 * USO: POST /reportes-operativos - Retorna el objeto creado.
 * -----------------------------------------------------------------------
 * Asigna guardia_id o usuario_id según req.userType y normaliza la dirección IP.
 * ================================================================================================
 */
exports.create = async (req, res) => {
    try {
        const isGuardia = req.userType === 'guardia';
        let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
        if (['::1', '::ffff:127.0.0.1'].includes(ip)) ip = '127.0.0.1';

        const reporte = await ReporteOperativo.create({
            ...req.body,
            guardia_id: isGuardia ? req.userId : null,
            usuario_id: !isGuardia ? (req.userId || null) : null,
            creado_por_tipo: isGuardia ? 'guardia' : 'usuario',
            aviso_central: !!req.body.aviso_central,
            aviso_jefatura: !!req.body.aviso_jefatura,
            ip_address: ip
        });

        res.status(201).json(reporte);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Mis Reportes
 * FUNCIÓN: Obtiene el historial de reportes creados por el usuario o guardia actual.
 * USO: GET /reportes-operativos/mis-reportes - Retorna array de reportes.
 * -----------------------------------------------------------------------
 * Filtra dinámicamente por ID del solicitante según su rol (guardia o usuario).
 * ================================================================================================
 */
exports.getMyReports = async (req, res) => {
    try {
        const where = req.userType === 'guardia' ? { guardia_id: req.userId } : { usuario_id: req.userId || null };
        res.json(await ReporteOperativo.findAll({ where, order: [['createdAt', 'DESC']] }));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
