const { MovimientoInventario, Producto, Usuario, TipoMovimiento, EntregaEpp, DetalleEntregaEpp, Guardia, sequelize, Categoria } = require('../models');
const { Op } = require('sequelize');

/**
 * ================================================================================================
 * NOMBRE: Listar Movimientos
 * FUNCIÓN: Obtiene el historial completo de movimientos de inventario con relaciones.
 * USO: GET /movimientos - Retorna array JSON con productos, usuarios y tipos asociados.
 * -----------------------------------------------------------------------
 * Ordena descendentemente por fecha para mostrar lo más reciente primero.
 * ================================================================================================
 */
exports.getAll = async (req, res) => {
    try {
        const movimientos = await MovimientoInventario.findAll({
            include: [
                { model: Producto, attributes: ['nombre', 'id'] },
                { model: Usuario, attributes: ['nombre', 'email'] },
                { model: TipoMovimiento, attributes: ['nombre'] }
            ],
            order: [['fecha_hora', 'DESC']]
        });
        res.status(200).json(movimientos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Listar Tipos de Movimiento
 * FUNCIÓN: Recupera el catálogo de tipos de movimientos disponibles (Entrada, Salida, etc.).
 * USO: GET /movimientos/tipos - Retorna array JSON de tipos.
 * -----------------------------------------------------------------------
 * Usado para poblar selectores en formularios de creación de movimientos.
 * ================================================================================================
 */
exports.getTypes = async (req, res) => {
    try {
        const tipos = await TipoMovimiento.findAll();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Registrar Movimiento
 * FUNCIÓN: Crea un movimiento de inventario, actualiza stock y opcionalmente genera entrega EPP.
 * USO: POST /movimientos - Retorna el objeto del movimiento creado.
 * -----------------------------------------------------------------------
 * Maneja transacción compleja: actualiza stock producto, crea movimiento y si es salida con destinatario, genera/actualiza borrador de Entrega EPP.
 * ================================================================================================
 */
exports.create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { producto_id, tipo_movimiento_id, cantidad, documento_asociado_id } = req.body;
        const usuario_id = req.userId;

        if (!producto_id || !tipo_movimiento_id || !cantidad) {
            return res.status(400).send({ message: "Faltan datos obligatorios." });
        }

        const [producto, tipo] = await Promise.all([
            Producto.findByPk(producto_id, { transaction: t }),
            TipoMovimiento.findByPk(tipo_movimiento_id, { transaction: t })
        ]);

        if (!producto || !tipo) return res.status(404).send({ message: "Producto o Tipo no encontrado." });

        const nombreTipo = tipo.nombre.toLowerCase();
        let nuevoStock = producto.stock_actual;
        let isSalida = false;

        if (['entrada', 'devolucion', 'ingreso'].some(k => nombreTipo.includes(k))) {
            nuevoStock += parseInt(cantidad);
        } else if (['salida', 'entrega', 'baja'].some(k => nombreTipo.includes(k))) {
            if (producto.stock_actual < cantidad) return res.status(400).send({ message: "Stock insuficiente." });
            nuevoStock -= parseInt(cantidad);
            isSalida = true;
        }

        await producto.update({ stock_actual: nuevoStock }, { transaction: t });

        const movimiento = await MovimientoInventario.create({
            producto_id, usuario_id, tipo_movimiento_id, cantidad,
            fecha_hora: new Date(), stock_resultante: nuevoStock,
            documento_asociado_id: documento_asociado_id || null
        }, { transaction: t });

        // Integración automática con Entrega EPP para salidas a Guardias
        if (isSalida && documento_asociado_id) {
            const guardia = await Guardia.findByPk(documento_asociado_id, { transaction: t });
            if (guardia) {
                const today = new Date();
                today.setHours(0,0,0,0);
                
                let entrega = await EntregaEpp.findOne({
                    where: {
                        rut_receptor: guardia.rut, estado: 'Borrador',
                        fecha_entrega: { [Op.gte]: today }
                    }, transaction: t
                });

                if (!entrega) {
                    entrega = await EntregaEpp.create({
                        rut_receptor: guardia.rut, nombre_receptor: guardia.nombre, cargo_receptor: 'Guardia',
                        responsable_id: usuario_id, fecha_entrega: new Date(), estado: 'Borrador',
                        observaciones: 'Auto-generado desde Inventario'
                    }, { transaction: t });
                }

                const cat = producto.categoria_id ? await Categoria.findByPk(producto.categoria_id, { transaction: t }) : null;
                const tipoDetalle = cat?.nombre?.toLowerCase().includes('epp') ? 'EPP' : 'Ropa';

                await DetalleEntregaEpp.create({
                    entrega_id: entrega.id, producto_id: producto.id, nombre_producto: producto.nombre,
                    cantidad, talla: 'Estándar', tipo: tipoDetalle
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(movimiento);

    } catch (error) {
        await t.rollback();
        console.error("Error create movimiento:", error);
        res.status(500).send({ message: error.message, details: error.original?.sqlMessage || error.toString() });
    }
};
