const { EntregaEpp, DetalleEntregaEpp, Producto, MovimientoInventario, TipoMovimiento, Auditoria, Usuario, Guardia, sequelize } = require('../models');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// --- Helpers ---
const getTipoMovimiento = () => TipoMovimiento.findOne({ where: { nombre: { [Op.or]: ['Entrega EPP', 'Entrega', 'Salida'] } } });

const updateInventory = async (item, tipoMovId, userId, t) => {
    if (!item.producto_id || !tipoMovId) return;
    const producto = await Producto.findByPk(item.producto_id, { transaction: t });
    if (!producto || producto.stock_actual < item.cantidad) throw new Error(`Stock insuficiente: ${producto?.nombre || 'Producto no encontrado'}`);
    
    const nuevoStock = producto.stock_actual - parseInt(item.cantidad);
    await producto.update({ stock_actual: nuevoStock }, { transaction: t });
    await MovimientoInventario.create({
        producto_id: producto.id, usuario_id: userId, tipo_movimiento_id: tipoMovId,
        cantidad: item.cantidad, fecha_hora: new Date(), stock_resultante: nuevoStock
    }, { transaction: t });
};

/**
 * ================================================================================================
 * NOMBRE: Crear Entrega EPP
 * FUNCIÓN: Registra una nueva entrega de EPP, actualiza stock y genera auditoría.
 * USO: POST /entregas
 * -----------------------------------------------------------------------
 * Maneja transacción para consistencia entre cabecera, detalles y movimientos de inventario.
 * ================================================================================================
 */
exports.createEntrega = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { usuario_id, nombre_receptor, rut_receptor, cargo_receptor, fecha_entrega, observaciones, firma_receptor, items } = req.body;
        const responsable_id = req.userId;

        const entrega = await EntregaEpp.create({
            usuario_id: usuario_id || null, nombre_receptor, rut_receptor, cargo_receptor, responsable_id,
            fecha_entrega: fecha_entrega || new Date(), observaciones, firma_receptor,
            estado: firma_receptor ? 'Firmado' : 'Borrador'
        }, { transaction: t });

        await Auditoria.create({
            usuario_id: responsable_id, accion: 'CREAR_ENTREGA_EPP',
            detalle: `Entrega ID: ${entrega.id} para ${nombre_receptor}`,
            ip_address: req.ip || req.connection.remoteAddress
        }, { transaction: t });

        const tipoMov = await getTipoMovimiento();
        
        for (const item of items) {
            await DetalleEntregaEpp.create({ ...item, entrega_id: entrega.id, tipo: item.tipo }, { transaction: t });
            await updateInventory(item, tipoMov?.id, responsable_id, t);
        }

        await t.commit();
        res.status(201).json({ message: 'Entrega registrada', entrega_id: entrega.id });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Listar Entregas
 * FUNCIÓN: Obtiene el historial completo de entregas con datos de receptor y responsable.
 * USO: GET /entregas
 * -----------------------------------------------------------------------
 * Incluye asociaciones para mostrar nombres y correos en el listado.
 * ================================================================================================
 */
exports.getEntregas = async (req, res) => {
    try {
        const entregas = await EntregaEpp.findAll({
            include: ['receptor', 'responsable'].map(a => ({ association: a, attributes: ['nombre', 'email'] })),
            order: [['fecha_entrega', 'DESC']]
        });
        res.json(entregas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Obtener Entrega por ID
 * FUNCIÓN: Devuelve los detalles completos de una entrega específica.
 * USO: GET /entregas/:id
 * -----------------------------------------------------------------------
 * Retorna 404 si no existe. Incluye items y actores involucrados.
 * ================================================================================================
 */
exports.getEntregaById = async (req, res) => {
    try {
        const entrega = await EntregaEpp.findByPk(req.params.id, {
            include: [
                { association: 'receptor', attributes: ['nombre', 'email'] },
                { association: 'responsable', attributes: ['nombre', 'email'] },
                { model: DetalleEntregaEpp }
            ]
        });
        entrega ? res.json(entrega) : res.status(404).json({ message: 'Entrega no encontrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Obtener Último Borrador
 * FUNCIÓN: Busca si existe un borrador pendiente para un RUT específico.
 * USO: GET /entregas/borrador?rut=12345678-9
 * -----------------------------------------------------------------------
 * Útil para recuperar sesiones previas no finalizadas.
 * ================================================================================================
 */
exports.getLastDraft = async (req, res) => {
    try {
        const { rut } = req.query;
        if (!rut) return res.status(400).json({ message: 'RUT requerido' });

        const entrega = await EntregaEpp.findOne({
            where: { rut_receptor: rut, estado: 'Borrador' },
            include: [{ model: DetalleEntregaEpp }],
            order: [['created_at', 'DESC']]
        });
        entrega ? res.json(entrega) : res.status(404).json({ message: 'Sin borradores' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Finalizar Entrega
 * FUNCIÓN: Cierra un borrador, actualiza detalles, firma y envía notificación.
 * USO: POST /entregas/finalizar
 * -----------------------------------------------------------------------
 * Si no existe borrador, crea uno nuevo. Genera PDF y envía correo asíncronamente.
 * ================================================================================================
 */
exports.finalizeEntrega = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { rut_receptor, firma_receptor, items, nombre_receptor, cargo_receptor, observaciones } = req.body;
        
        let entrega = await EntregaEpp.findOne({ 
            where: { rut_receptor, estado: 'Borrador' }, 
            include: [DetalleEntregaEpp], transaction: t 
        });

        if (!entrega) {
            entrega = await EntregaEpp.create({
                rut_receptor, nombre_receptor, cargo_receptor, responsable_id: req.userId,
                fecha_entrega: new Date(), observaciones, estado: 'Borrador'
            }, { transaction: t });
        }

        for (const item of items) {
            const detail = entrega.DetalleEntregaEpps?.find(d => d.nombre_producto === item.nombre_producto);
            if (detail) {
                await detail.update({ talla: item.talla, observaciones: item.observaciones }, { transaction: t });
            } else {
                await DetalleEntregaEpp.create({ ...item, entrega_id: entrega.id, tipo: item.tipo || 'Ropa/EPP' }, { transaction: t });
            }
        }

        await entrega.update({ firma_receptor, estado: 'Entregado', fecha_entrega: new Date(), observaciones }, { transaction: t });
        await t.commit();

        const fullEntrega = await EntregaEpp.findByPk(entrega.id, { include: [DetalleEntregaEpp] });
        generatePdf(fullEntrega, firma_receptor).then(pdf => sendEmail(fullEntrega, pdf)).catch(console.error);

        res.status(200).json({ message: 'Entrega finalizada' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// --- PDF & Email Logic ---

const generatePdf = (entrega, firmaBase64) => new Promise((resolve, reject) => {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(18).text('COMPROBANTE DE ENTREGA DE EPP', { align: 'center' }).moveDown();
        doc.fontSize(10).text(`Emisión: ${new Date().toLocaleDateString()}`, { align: 'right' }).moveDown();
        
        doc.font('Helvetica-Bold').text('INFORMACIÓN DEL RECEPTOR:');
        doc.font('Helvetica').text(`Nombre: ${entrega.nombre_receptor}`).text(`RUT: ${entrega.rut_receptor}`)
           .text(`Cargo: ${entrega.cargo_receptor || 'Guardia'}`).text(`Fecha: ${new Date(entrega.fecha_entrega).toLocaleDateString()}`);
        if (entrega.observaciones) doc.text(`Obs: ${entrega.observaciones}`);
        doc.moveDown(2);

        const yStart = doc.y;
        doc.font('Helvetica-Bold').text('Producto', 50, yStart).text('Cant.', 300, yStart).text('Talla', 350, yStart).text('Obs.', 400, yStart);
        doc.moveTo(50, yStart + 15).lineTo(550, yStart + 15).stroke();
        
        let y = yStart + 25;
        doc.font('Helvetica');
        entrega.DetalleEntregaEpps.forEach(item => {
            if (y > 700) { doc.addPage(); y = 50; }
            doc.text(item.nombre_producto, 50, y, { width: 240 });
            doc.text(item.cantidad.toString(), 300, y);
            doc.text(item.talla || '-', 350, y);
            doc.text(item.observaciones || '-', 400, y, { width: 150 });
            y += 30;
        });

        if (firmaBase64) {
            if (y > 600) doc.addPage();
            doc.text('Firma:', 50, y + 40);
            try {
                doc.image(Buffer.from(firmaBase64.split(',')[1], 'base64'), 50, y + 50, { fit: [200, 100] });
            } catch { doc.text('(Firma Digital)', 50, y + 50); }
        }

        doc.fontSize(8).text('Generado por Syseg', 50, 750, { align: 'center' });
        doc.end();
    } catch (e) { reject(e); }
});

const sendEmail = async (entrega, pdfBuffer) => {
    try {
        const supervisores = await Usuario.findAll({ where: { rol_id: 3, estado: true }, attributes: ['email'] });
        let destinatarios = supervisores.map(s => s.email).filter(Boolean);

        let emailReceptor = entrega.usuario_id ? (await Usuario.findByPk(entrega.usuario_id))?.email : null;
        if (!emailReceptor && entrega.rut_receptor) emailReceptor = (await Guardia.findOne({ where: { rut: entrega.rut_receptor } }))?.email;
        if (emailReceptor) destinatarios.push(emailReceptor);

        const to = [...new Set(destinatarios)].join(',');
        if (!to) return;

        await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'Syseg'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to, subject: `[ENTREGA EPP] ${entrega.nombre_receptor}`,
            html: `<h3>Entrega EPP</h3><ul><li>Receptor: ${entrega.nombre_receptor}</li><li>RUT: ${entrega.rut_receptor}</li></ul>`,
            attachments: [{ filename: `Entrega_${entrega.rut_receptor}.pdf`, content: pdfBuffer }]
        });
    } catch (e) { console.error("Email error:", e); }
};
