const { EntregaEpp, DetalleEntregaEpp, Producto, MovimientoInventario, TipoMovimiento, Auditoria, sequelize } = require('../models');

exports.createEntrega = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuario_id, nombre_receptor, rut_receptor, cargo_receptor, fecha_entrega, observaciones, firma_receptor, items } = req.body;
        const responsable_id = req.userId; // From authJwt

        // 1. Crear Cabecera de Entrega
        const entrega = await EntregaEpp.create({
            usuario_id: usuario_id || null, 
            nombre_receptor,
            rut_receptor,
            cargo_receptor,
            responsable_id,
            fecha_entrega: fecha_entrega || new Date(),
            observaciones,
            firma_receptor,
            estado: firma_receptor ? 'Firmado' : 'Borrador'
        }, { transaction: t });

        // Registrar Auditoría
        await Auditoria.create({
            usuario_id: responsable_id,
            accion: 'CREAR_ENTREGA_EPP',
            detalle: `Se creó entrega EPP ID: ${entrega.id} para ${nombre_receptor} (${rut_receptor})`,
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        }, { transaction: t });

        // Buscar tipo de movimiento para Salida
        // Intentamos encontrar 'Entrega EPP', 'Entrega', o 'Salida'
        const { Op } = require('sequelize');
        let tipoMov = await TipoMovimiento.findOne({ 
            where: { 
                nombre: { [Op.or]: ['Entrega EPP', 'Entrega', 'Salida'] } 
            } 
        });

        for (const item of items) {
            // 2. Crear Detalle
            await DetalleEntregaEpp.create({
                entrega_id: entrega.id,
                producto_id: item.producto_id || null,
                nombre_producto: item.nombre,
                cantidad: item.cantidad,
                talla: item.talla,
                tipo: item.tipo
            }, { transaction: t });

            // 3. Actualizar Inventario (solo si hay producto_id y tipoMov válido)
            if (item.producto_id && tipoMov) {
                const producto = await Producto.findByPk(item.producto_id, { transaction: t });
                if (producto) {
                    // Verificar stock
                    if (producto.stock_actual < item.cantidad) {
                        throw new Error(`Stock insuficiente para ${producto.nombre} (Solicitado: ${item.cantidad}, Disponible: ${producto.stock_actual})`);
                    }
                    
                    const nuevoStock = producto.stock_actual - parseInt(item.cantidad);
                    await producto.update({ stock_actual: nuevoStock }, { transaction: t });

                    // Registrar Movimiento
                    await MovimientoInventario.create({
                        producto_id: producto.id,
                        usuario_id: responsable_id,
                        tipo_movimiento_id: tipoMov.id,
                        cantidad: item.cantidad,
                        fecha_hora: new Date(),
                        stock_resultante: nuevoStock
                        // documento_asociado_id: entrega.id // No existe FK directa en el modelo actual
                    }, { transaction: t });
                }
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Entrega registrada exitosamente', entrega_id: entrega.id });
    } catch (error) {
        await t.rollback();
        console.error("Error en createEntrega:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEntregas = async (req, res) => {
    try {
        const entregas = await EntregaEpp.findAll({
            include: [
                { association: 'receptor', attributes: ['nombre', 'email'] },
                { association: 'responsable', attributes: ['nombre', 'email'] }
            ],
            order: [['fecha_entrega', 'DESC']]
        });
        res.json(entregas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEntregaById = async (req, res) => {
    try {
        const entrega = await EntregaEpp.findByPk(req.params.id, {
            include: [
                { association: 'receptor', attributes: ['nombre', 'email'] },
                { association: 'responsable', attributes: ['nombre', 'email'] },
                { model: DetalleEntregaEpp }
            ]
        });
        if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });
        res.json(entrega);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
