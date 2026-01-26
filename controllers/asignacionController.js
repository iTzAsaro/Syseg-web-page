const { Asignacion, Guardia, Local } = require('../models');
const { Op } = require('sequelize');

/**
 * Crea una nueva asignación de turno para un guardia.
 * Valida que no existan superposiciones de horario para el mismo guardia.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 */
const createAsignacion = async (req, res) => {
    try {
        const { guardia_id, local_id, fecha, turno, hora_inicio, hora_fin, observacion } = req.body;

        // Validar superposición de horarios para el mismo guardia
        const existingAssignment = await Asignacion.findOne({
            where: {
                guardia_id,
                fecha,
                [Op.or]: [
                    {
                        hora_inicio: {
                            [Op.between]: [hora_inicio, hora_fin]
                        }
                    },
                    {
                        hora_fin: {
                            [Op.between]: [hora_inicio, hora_fin]
                        }
                    },
                    {
                        [Op.and]: [
                            { hora_inicio: { [Op.lte]: hora_inicio } },
                            { hora_fin: { [Op.gte]: hora_fin } }
                        ]
                    }
                ]
            }
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'El guardia ya tiene una asignación en ese horario.' });
        }

        const asignacion = await Asignacion.create({
            guardia_id,
            local_id,
            fecha,
            turno,
            hora_inicio,
            hora_fin,
            observacion
        });

        const asignacionConDatos = await Asignacion.findByPk(asignacion.id, {
            include: [
                { model: Guardia, attributes: ['id', 'nombre', 'rut'] },
                { model: Local, attributes: ['id', 'nombre'] }
            ]
        });

        res.status(201).json(asignacionConDatos);
    } catch (error) {
        console.error('Error creando asignación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Obtiene la lista de asignaciones con filtros opcionales.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 */
const getAsignaciones = async (req, res) => {
    try {
        const { start_date, end_date, guardia_id, local_id } = req.query;
        const whereClause = {};

        if (start_date && end_date) {
            whereClause.fecha = { [Op.between]: [start_date, end_date] };
        } else if (start_date) {
            whereClause.fecha = { [Op.gte]: start_date };
        }

        if (guardia_id) whereClause.guardia_id = guardia_id;
        if (local_id) whereClause.local_id = local_id;

        const asignaciones = await Asignacion.findAll({
            where: whereClause,
            include: [
                { model: Guardia, attributes: ['id', 'nombre', 'rut'] },
                { model: Local, attributes: ['id', 'nombre', 'direccion'] }
            ],
            order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
        });

        res.json(asignaciones);
    } catch (error) {
        console.error('Error obteniendo asignaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Actualiza una asignación existente.
 * Valida conflictos de horario si se modifican las horas.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 */
const updateAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { guardia_id, local_id, fecha, turno, hora_inicio, hora_fin, estado, observacion } = req.body;

        const asignacion = await Asignacion.findByPk(id);
        if (!asignacion) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }

        // Si se cambian fechas/horas, validar superposición (excluyendo la actual)
        if (guardia_id && (fecha || hora_inicio || hora_fin)) {
            const checkGuardia = guardia_id || asignacion.guardia_id;
            const checkFecha = fecha || asignacion.fecha;
            const checkInicio = hora_inicio || asignacion.hora_inicio;
            const checkFin = hora_fin || asignacion.hora_fin;

            const existingAssignment = await Asignacion.findOne({
                where: {
                    id: { [Op.ne]: id },
                    guardia_id: checkGuardia,
                    fecha: checkFecha,
                    [Op.or]: [
                        { hora_inicio: { [Op.between]: [checkInicio, checkFin] } },
                        { hora_fin: { [Op.between]: [checkInicio, checkFin] } },
                        {
                            [Op.and]: [
                                { hora_inicio: { [Op.lte]: checkInicio } },
                                { hora_fin: { [Op.gte]: checkFin } }
                            ]
                        }
                    ]
                }
            });

            if (existingAssignment) {
                return res.status(400).json({ message: 'El guardia ya tiene una asignación en ese horario.' });
            }
        }

        await asignacion.update(req.body);
        
        // Recargar con relaciones
        const updatedAsignacion = await Asignacion.findByPk(id, {
            include: [
                { model: Guardia, attributes: ['id', 'nombre', 'rut'] },
                { model: Local, attributes: ['id', 'nombre'] }
            ]
        });

        res.json(updatedAsignacion);
    } catch (error) {
        console.error('Error actualizando asignación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

/**
 * Elimina una asignación del sistema.
 * @param {Object} req - Objeto de solicitud Express.
 * @param {Object} res - Objeto de respuesta Express.
 */
const deleteAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Asignacion.destroy({ where: { id } });
        if (!result) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
        console.error('Error eliminando asignación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    createAsignacion,
    getAsignaciones,
    updateAsignacion,
    deleteAsignacion
};
