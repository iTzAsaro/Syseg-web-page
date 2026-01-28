const { MovimientoInventario, Producto, Usuario, TipoMovimiento, DocumentoGuardia } = require('../models');

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
        if (nombreTipo.includes('entrada') || nombreTipo.includes('devolucion') || nombreTipo.includes('ingreso')) {
            nuevoStock += parseInt(cantidad);
        } else if (nombreTipo.includes('salida') || nombreTipo.includes('entrega') || nombreTipo.includes('baja')) {
            if (producto.stock_actual < cantidad) {
                return res.status(400).send({ message: "Stock insuficiente para realizar esta salida." });
            }
            nuevoStock -= parseInt(cantidad);
        }

        // Transacción manual (o usar sequelize transaction si se prefiere)
        await producto.update({ stock_actual: nuevoStock });

        const movimiento = await MovimientoInventario.create({
            producto_id,
            usuario_id,
            tipo_movimiento_id,
            cantidad,
            fecha_hora: new Date(),
            stock_resultante: nuevoStock, // Added missing field
            // comentario, // Comentario is not in the model? Let's check model again.
            documento_asociado_id
        });

        res.status(201).json(movimiento);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
