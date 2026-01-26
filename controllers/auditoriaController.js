const { Auditoria, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.listarLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, usuario_id, accion, fecha_inicio, fecha_fin } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (usuario_id) where.usuario_id = usuario_id;
        if (accion) where.accion = { [Op.like]: `%${accion}%` };
        if (fecha_inicio && fecha_fin) {
            where.fecha = { [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)] };
        }

        const { count, rows } = await Auditoria.findAndCountAll({
            where,
            include: [{ model: Usuario, attributes: ['nombre', 'email'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fecha', 'DESC']]
        });

        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            logs: rows
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
