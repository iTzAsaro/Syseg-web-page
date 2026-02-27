const { Asignacion, Guardia, Local } = require('../models');
const { Op } = require('sequelize');

/**
 * NOMBRE: Verificar Superposición de Horarios
 * FUNCIÓN: Comprueba si un guardia tiene conflictos de horario en una fecha específica.
 * USO: await checkScheduleOverlap(params) - Retorna la asignación conflictiva si existe.
 * -----------------------------------------------------------------------
 * Utiliza Op.or para detectar solapamientos totales o parciales en el rango de tiempo.
 */
const checkScheduleOverlap = async ({ guardia_id, fecha, hora_inicio, hora_fin, excludeId }) => {
    const where = {
        guardia_id, fecha,
        [Op.or]: [
            { hora_inicio: { [Op.between]: [hora_inicio, hora_fin] } },
            { hora_fin: { [Op.between]: [hora_inicio, hora_fin] } },
            { [Op.and]: [{ hora_inicio: { [Op.lte]: hora_inicio } }, { hora_fin: { [Op.gte]: hora_fin } }] }
        ]
    };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return await Asignacion.findOne({ where });
};

/**
 * NOMBRE: Obtener Asignación Completa
 * FUNCIÓN: Recupera una asignación con datos del guardia y local asociados.
 * USO: await getWithRelations(id) - Retorna objeto Asignacion con includes.
 * -----------------------------------------------------------------------
 * Optimiza la consulta mediante Eager Loading de las relaciones necesarias.
 */
const getWithRelations = (id) => Asignacion.findByPk(id, {
    include: [
        { model: Guardia, attributes: ['id', 'nombre', 'rut'] },
        { model: Local, attributes: ['id', 'nombre'] }
    ]
});

/**
 * NOMBRE: Crear Asignación
 * FUNCIÓN: Registra un nuevo turno validando disponibilidad del guardia.
 * USO: POST /asignaciones - Retorna objeto creado.
 * -----------------------------------------------------------------------
 * Verifica conflictos de horario antes de insertar el registro.
 */
exports.createAsignacion = async (req, res) => {
    try {
        const { guardia_id, local_id, fecha, hora_inicio, hora_fin } = req.body;
        if (!guardia_id || !local_id || !fecha || !hora_inicio || !hora_fin) 
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });

        if (await checkScheduleOverlap(req.body)) 
            return res.status(400).json({ message: 'Conflicto de horario detectado.' });

        const nueva = await Asignacion.create(req.body);
        res.status(201).json(await getWithRelations(nueva.id));
    } catch (e) { res.status(500).json({ message: 'Error al crear asignación.' }); }
};

/**
 * NOMBRE: Listar Asignaciones
 * FUNCIÓN: Obtiene asignaciones filtradas por fecha, guardia o local.
 * USO: GET /asignaciones - Retorna lista ordenada por fecha y hora.
 * -----------------------------------------------------------------------
 * Construye filtros dinámicos basados en query params.
 */
exports.getAsignaciones = async (req, res) => {
    try {
        const { start_date, end_date, guardia_id, local_id } = req.query;
        const where = {};
        
        if (start_date) where.fecha = end_date ? { [Op.between]: [start_date, end_date] } : { [Op.gte]: start_date };
        if (guardia_id) where.guardia_id = guardia_id;
        if (local_id) where.local_id = local_id;

        const data = await Asignacion.findAll({
            where,
            include: [
                { model: Guardia, attributes: ['id', 'nombre', 'rut'] },
                { model: Local, attributes: ['id', 'nombre', 'direccion'] }
            ],
            order: [['fecha', 'ASC'], ['hora_inicio', 'ASC']]
        });
        res.json(data);
    } catch (e) { res.status(500).json({ message: 'Error al obtener asignaciones.' }); }
};

/**
 * NOMBRE: Actualizar Asignación
 * FUNCIÓN: Modifica una asignación existente revalidando disponibilidad.
 * USO: PUT /asignaciones/:id - Retorna objeto actualizado.
 * -----------------------------------------------------------------------
 * Excluye el ID actual de la validación de conflictos de horario.
 */
exports.updateAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const asignacion = await Asignacion.findByPk(id);
        if (!asignacion) return res.status(404).json({ message: 'Asignación no encontrada.' });

        const { guardia_id, fecha, hora_inicio, hora_fin } = req.body;
        if ((guardia_id || fecha || hora_inicio || hora_fin) && 
            await checkScheduleOverlap({ 
                guardia_id: guardia_id || asignacion.guardia_id,
                fecha: fecha || asignacion.fecha,
                hora_inicio: hora_inicio || asignacion.hora_inicio,
                hora_fin: hora_fin || asignacion.hora_fin,
                excludeId: id 
            })) {
            return res.status(400).json({ message: 'Conflicto de horario al actualizar.' });
        }

        await asignacion.update(req.body);
        res.json(await getWithRelations(id));
    } catch (e) { res.status(500).json({ message: 'Error al actualizar asignación.' }); }
};

/**
 * NOMBRE: Eliminar Asignación
 * FUNCIÓN: Remueve una asignación por su ID.
 * USO: DELETE /asignaciones/:id - Retorna confirmación.
 * -----------------------------------------------------------------------
 * Elimina físicamente el registro de la base de datos.
 */
exports.deleteAsignacion = async (req, res) => {
    try {
        const deleted = await Asignacion.destroy({ where: { id: req.params.id } });
        deleted ? res.json({ message: 'Eliminado correctamente.' }) 
                : res.status(404).json({ message: 'No encontrado.' });
    } catch (e) { res.status(500).json({ message: 'Error al eliminar.' }); }
};
