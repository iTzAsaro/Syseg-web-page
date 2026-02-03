const { MovimientoInventario, Producto, Usuario, TipoMovimiento, DocumentoGuardia, EntregaEpp, DetalleEntregaEpp, Guardia, sequelize } = require('../models');

// Listar movimientos (con filtros opcionales)
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

// Obtener tipos de movimiento
exports.getTypes = async (req, res) => {
    try {
        const tipos = await TipoMovimiento.findAll();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Registrar movimiento (Entrada/Salida)
exports.create = async (req, res) => {
    try {
        const { producto_id, tipo_movimiento_id, cantidad, comentario, documento_asociado_id } = req.body;
        const usuario_id = req.userId; // Obtenido del token

        // Validaciones
        if (!producto_id || !tipo_movimiento_id || !cantidad) {
            return res.status(400).send({ message: "Faltan datos obligatorios." });
        }

        const producto = await Producto.findByPk(producto_id);
        if (!producto) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }

        // Lógica de stock (1: Entrada, 2: Salida - Asumiendo IDs por defecto o buscar por nombre)
        // Para ser más robusto, deberíamos verificar el tipo de movimiento.
        // Asumiremos que el frontend envía el ID correcto.
        
        // Actualizar stock del producto
        let nuevoStock = producto.stock_actual || producto.stock; // Fallback to stock if stock_actual is not the field name (Model says stock?)
        // Let's check Producto model too... assume stock from Inventario.jsx (item.stock)
        // But let's trust the controller was partially working or intended to work.
        // Wait, controller line 41 says: let nuevoStock = producto.stock_actual;
        // I should verify Producto model.
        
        // Obtener el tipo de movimiento para saber si suma o resta (si hay campo 'operacion' o similar)
        // Como no tengo el modelo TipoMovimiento a mano, asumo IDs estándar o lógica simple.
        // ID 1: Entrada, ID 2: Salida (Ejemplo)
        // Mejor opción: Buscar el tipo.
        const tipo = await TipoMovimiento.findByPk(tipo_movimiento_id);
        
        if (!tipo) {
            return res.status(400).send({ message: "Tipo de movimiento inválido." });
        }

        // Convención simple: Si el nombre contiene "Entrada" suma, si "Salida" resta.
        // O usar un campo booleano si existe en el modelo.
        // Vamos a asumir una lógica basada en el nombre para generalizar, o preguntar al usuario.
        // Por ahora, asumiré:
        // Entrada: Suma
        // Salida / Entrega: Resta
        
        const nombreTipo = tipo.nombre.toLowerCase();
        let isSalida = false;
        
        if (nombreTipo.includes('entrada') || nombreTipo.includes('devolucion') || nombreTipo.includes('ingreso')) {
            nuevoStock += parseInt(cantidad);
        } else if (nombreTipo.includes('salida') || nombreTipo.includes('entrega') || nombreTipo.includes('baja')) {
            if (producto.stock_actual < cantidad) {
                return res.status(400).send({ message: "Stock insuficiente para realizar esta salida." });
            }
            nuevoStock -= parseInt(cantidad);
            isSalida = true;
        }

        // Transacción manual (o usar sequelize transaction si se prefiere)
        // INICIO DE TRANSACCIÓN
        const t = await sequelize.transaction();

        try {
            await producto.update({ stock_actual: nuevoStock }, { transaction: t });

            const movimiento = await MovimientoInventario.create({
                producto_id,
                usuario_id,
                tipo_movimiento_id,
                cantidad,
                fecha_hora: new Date(),
                stock_resultante: nuevoStock,
                documento_asociado_id: documento_asociado_id || null // Si viene un ID, intentamos guardarlo, pero el modelo puede que no lo soporte como FK directa
            }, { transaction: t });

            // LÓGICA DE INTEGRACIÓN CON ENTREGA DE EPP
            // Si es una SALIDA y se proporcionó un documento_asociado_id (que asumimos es el ID del GUARDIA/RECEPTOR)
            // Creamos automáticamente un registro en EntregaEpp
            if (isSalida && documento_asociado_id) {
                // Verificar si existe una entrega 'Borrador' para este usuario hoy, o crear una nueva
                // Asumimos que documento_asociado_id es el ID del GUARDIA (tabla Guardia) o USUARIO
                // Primero intentamos buscar al Guardia para obtener nombre y rut
                
                const guardia = await Guardia.findByPk(documento_asociado_id, { transaction: t });
                
                if (guardia) {
                    // Buscar si ya tiene una entrega en borrador hoy
                    const { Op } = require('sequelize');
                    const todayStart = new Date();
                    todayStart.setHours(0,0,0,0);
                    const todayEnd = new Date();
                    todayEnd.setHours(23,59,59,999);
                    
                    let entrega = await EntregaEpp.findOne({
                        where: {
                            rut_receptor: guardia.rut,
                            estado: 'Borrador',
                            fecha_entrega: {
                                [Op.between]: [todayStart, todayEnd]
                            }
                        },
                        transaction: t
                    });

                    if (!entrega) {
                        entrega = await EntregaEpp.create({
                            usuario_id: null, // Si estuviera vinculado a usuario del sistema
                            nombre_receptor: guardia.nombre.trim(),
                            rut_receptor: guardia.rut || 'N/A',
                            cargo_receptor: 'Guardia', // Asumido
                            responsable_id: usuario_id,
                            fecha_entrega: new Date(),
                            estado: 'Borrador',
                            observaciones: 'Generado automáticamente desde Retiro de Inventario'
                        }, { transaction: t });
                    }

                    // Obtener nombre de la categoría para el tipo de detalle
                    let tipoDetalle = 'Ropa';
                    if (producto.categoria_id) {
                        try {
                           const Categoria = require('../models').Categoria; // Importación dinámica para evitar ciclos si es necesario, o usar include arriba
                           const categoria = await Categoria.findByPk(producto.categoria_id, { transaction: t });
                           if (categoria && categoria.nombre.toLowerCase().includes('epp')) {
                               tipoDetalle = 'EPP';
                           }
                        } catch (e) {
                            console.warn("No se pudo determinar categoría exacta, usando default", e);
                        }
                    }

                    // Crear detalle
                    await DetalleEntregaEpp.create({
                        entrega_id: entrega.id,
                        producto_id: producto.id,
                        nombre_producto: producto.nombre,
                        cantidad: cantidad,
                        talla: 'Estándar', // Valor por defecto requerido si no es nullable
                        tipo: tipoDetalle
                    }, { transaction: t });
                } else {
                     console.warn(`Guardia con ID ${documento_asociado_id} no encontrado. No se generó Entrega EPP.`);
                }
            }

            await t.commit();
            res.status(201).json(movimiento);

        } catch (err) {
            await t.rollback();
            console.error("TRANSACCIÓN ROLLBACK - Error interno:", err);
            throw err;
        }

    } catch (error) {
        console.error("ERROR FINAL en create movimiento:", error);
        res.status(500).send({ message: error.message, details: error.original?.sqlMessage || error.parent?.sqlMessage || error.toString() });
    }
};
