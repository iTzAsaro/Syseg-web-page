const { Guardia, Afp, SistemaSalud, Comuna } = require('../models');

/**
 * ================================================================================================
 * NOMBRE: Crear Guardia
 * FUNCIÓN: Registra un nuevo guardia en el sistema.
 * USO: POST /guardias - Retorna el objeto del guardia creado.
 * -----------------------------------------------------------------------
 * Crea el registro directamente con los datos del body. La contraseña se almacena en texto plano según requisitos actuales.
 * ================================================================================================
 */
exports.crear = async (req, res) => {
    try {
        const guardia = await Guardia.create(req.body);
        res.status(201).send(guardia);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Listar Guardias
 * FUNCIÓN: Obtiene todos los guardias con sus relaciones (AFP, Salud, Comuna).
 * USO: GET /guardias - Retorna array JSON de guardias.
 * -----------------------------------------------------------------------
 * Incluye modelos relacionados para mostrar nombres en lugar de IDs en el frontend.
 * ================================================================================================
 */
exports.buscarTodos = async (req, res) => {
    try {
        const guardias = await Guardia.findAll({ include: [Afp, SistemaSalud, Comuna] });
        res.status(200).send(guardias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Obtener Guardia por ID
 * FUNCIÓN: Busca un guardia específico por su identificador único.
 * USO: GET /guardias/:id - Retorna objeto JSON o 404 si no existe.
 * -----------------------------------------------------------------------
 * Utiliza findByPk con includes para devolver el perfil completo del guardia.
 * ================================================================================================
 */
exports.buscarUno = async (req, res) => {
    try {
        const guardia = await Guardia.findByPk(req.params.id, { include: [Afp, SistemaSalud, Comuna] });
        guardia ? res.status(200).send(guardia) : res.status(404).send({ message: "Guardia no encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Actualizar Guardia
 * FUNCIÓN: Modifica los datos de un guardia existente.
 * USO: PUT /guardias/:id - Retorna el objeto actualizado.
 * -----------------------------------------------------------------------
 * Verifica existencia antes de actualizar. Devuelve el registro actualizado incluso si no hubo cambios efectivos.
 * ================================================================================================
 */
exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Guardia.update(req.body, { where: { id } });
        if (updated === 0 && !(await Guardia.findByPk(id))) {
            return res.status(404).send({ message: "Guardia no encontrado." });
        }
        res.status(200).send(await Guardia.findByPk(id));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Eliminar Guardia
 * FUNCIÓN: Elimina permanentemente un guardia del sistema.
 * USO: DELETE /guardias/:id - Retorna 204 No Content.
 * -----------------------------------------------------------------------
 * Utiliza destroy con where clause. Retorna 404 si el ID no corresponde a ningún registro.
 * ================================================================================================
 */
exports.eliminar = async (req, res) => {
    try {
        const deleted = await Guardia.destroy({ where: { id: req.params.id } });
        deleted ? res.status(204).send() : res.status(404).send({ message: "Guardia no encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
