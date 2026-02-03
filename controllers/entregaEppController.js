const { EntregaEpp, DetalleEntregaEpp, Producto, MovimientoInventario, TipoMovimiento, Auditoria, Usuario, Guardia, sequelize } = require('../models');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Configuración de transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

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

exports.getLastDraft = async (req, res) => {
    try {
        const { rut } = req.query;
        if (!rut) return res.status(400).json({ message: 'RUT es requerido' });

        const entrega = await EntregaEpp.findOne({
            where: { 
                rut_receptor: rut,
                estado: 'Borrador'
            },
            include: [{ model: DetalleEntregaEpp }],
            order: [['created_at', 'DESC']]
        });

        if (!entrega) return res.status(404).json({ message: 'No hay borradores pendientes' });
        res.json(entrega);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.finalizeEntrega = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { rut_receptor, firma_receptor, items, nombre_receptor, cargo_receptor, fecha_entrega, observaciones } = req.body;
        const responsable_id = req.userId;

        // 1. Buscar Borrador
        let entrega = await EntregaEpp.findOne({
            where: { rut_receptor, estado: 'Borrador' },
            include: [{ model: DetalleEntregaEpp }],
            transaction: t
        });

        if (!entrega) {
            // Crear nueva si no existe (Caso manual o error de sincronización)
            entrega = await EntregaEpp.create({
                rut_receptor,
                nombre_receptor,
                cargo_receptor,
                fecha_entrega: fecha_entrega || new Date(),
                observaciones,
                estado: 'Borrador',
                responsable_id
            }, { transaction: t });
        }

        // 2. Actualizar Detalles
        // Primero, manejamos los items que vienen del frontend
        for (const item of items) {
            // Intentamos buscar coincidencia por nombre de producto en los detalles existentes
            const detail = entrega.DetalleEntregaEpps?.find(d => d.nombre_producto === item.nombre_producto);
            
            if (detail) {
                // Actualizar talla y observaciones
                await detail.update({
                    talla: item.talla,
                    observaciones: item.observaciones
                }, { transaction: t });
            } else {
                // Si no existe (agregado manualmente en el frontend?), lo creamos
                await DetalleEntregaEpp.create({
                    entrega_id: entrega.id,
                    nombre_producto: item.nombre_producto,
                    cantidad: item.cantidad,
                    talla: item.talla,
                    observaciones: item.observaciones,
                    tipo: item.tipo || 'Ropa/EPP'
                }, { transaction: t });
            }
        }

        // 3. Finalizar Entrega
        await entrega.update({
            firma_receptor,
            estado: 'Entregado',
            fecha_entrega: new Date(),
            observaciones: observaciones // Actualizar observaciones generales si cambiaron
        }, { transaction: t });

        await t.commit();

        // 4. Generar PDF y Enviar Correo (Fuera de la transacción DB)
        // Recargar entrega con todos los datos actualizados
        const entregaFinal = await EntregaEpp.findByPk(entrega.id, {
            include: [{ model: DetalleEntregaEpp }]
        });

        try {
            const pdfBuffer = await generatePdf(entregaFinal, firma_receptor);
            await sendEmail(entregaFinal, pdfBuffer);
        } catch (emailErr) {
            console.error("Error enviando correo/pdf:", emailErr);
            // No fallamos la request HTTP si el correo falla, pero logueamos el error
        }

        res.status(200).json({ message: 'Entrega finalizada y enviada por correo' });

    } catch (error) {
        await t.rollback();
        console.error("Error finalizeEntrega:", error);
        res.status(500).json({ message: error.message });
    }
};

const generatePdf = (entrega, firmaBase64) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // --- Header ---
            doc.fontSize(18).text('COMPROBANTE DE ENTREGA DE EPP', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(10);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, { align: 'right' });
            doc.moveDown();

            // --- Información del Receptor ---
            doc.font('Helvetica-Bold').text('INFORMACIÓN DEL RECEPTOR:');
            doc.font('Helvetica');
            doc.text(`Nombre: ${entrega.nombre_receptor}`);
            doc.text(`RUT: ${entrega.rut_receptor}`);
            doc.text(`Cargo: ${entrega.cargo_receptor || 'Guardia de Seguridad'}`);
            doc.text(`Fecha de Entrega: ${new Date(entrega.fecha_entrega).toLocaleDateString()}`);
            if (entrega.observaciones) {
                doc.text(`Observaciones Generales: ${entrega.observaciones}`);
            }
            doc.moveDown(2);

            // --- Tabla de Detalles ---
            const tableTop = doc.y;
            const itemX = 50;
            const cantX = 300;
            const tallaX = 350;
            const obsX = 400;

            // Encabezados
            doc.font('Helvetica-Bold');
            doc.text('Producto / Elemento', itemX, tableTop);
            doc.text('Cant.', cantX, tableTop);
            doc.text('Talla', tallaX, tableTop);
            doc.text('Observaciones', obsX, tableTop);
            
            // Línea separadora
            doc.moveTo(itemX, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            
            doc.font('Helvetica');
            let y = tableTop + 25;

            entrega.DetalleEntregaEpps.forEach(item => {
                // Verificar si necesitamos nueva página
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }

                doc.text(item.nombre_producto, itemX, y, { width: 240 });
                doc.text(item.cantidad.toString(), cantX, y);
                doc.text(item.talla || '-', tallaX, y);
                doc.text(item.observaciones || '-', obsX, y, { width: 150 });
                y += 30; // Espacio entre filas
            });

            doc.moveDown(2);

            // --- Firma ---
            if (firmaBase64) {
                try {
                    const signatureImage = firmaBase64.split(',')[1];
                    // Asegurar que hay espacio para la firma
                    if (doc.y > 600) doc.addPage();
                    
                    doc.y = y + 40;
                    doc.text('Firma del Receptor:', 50, doc.y);
                    doc.image(Buffer.from(signatureImage, 'base64'), 50, doc.y + 10, { fit: [200, 100] });
                } catch (imgErr) {
                    console.error("Error incrustando firma:", imgErr);
                    doc.text('(Firma Digital Registrada en Sistema)', 50, doc.y + 50);
                }
            } else {
                 doc.text('(Sin Firma Digital)', 50, y + 50);
            }

            // Pie de página
            doc.fontSize(8).text('Documento generado automáticamente por sistema Syseg', 50, 750, { align: 'center', width: 500 });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

const sendEmail = async (entrega, pdfBuffer) => {
    try {
        const destinatarios = [];

        // 1. Obtener correos de supervisores (rol_id: 3) activos
        const supervisores = await Usuario.findAll({
            where: {
                rol_id: 3,
                estado: true
            },
            attributes: ['email']
        });
        supervisores.forEach(s => {
            if (s.email) destinatarios.push(s.email);
        });

        // 2. Obtener correo del Receptor (Persona que retira)
        let emailReceptor = null;

        // Intentar buscar por usuario_id primero
        if (entrega.usuario_id) {
            const usuarioReceptor = await Usuario.findByPk(entrega.usuario_id);
            if (usuarioReceptor && usuarioReceptor.email) {
                emailReceptor = usuarioReceptor.email;
            }
        }

        // Si no se encontró por usuario, buscar en tabla Guardia por RUT
        if (!emailReceptor && entrega.rut_receptor) {
            const guardia = await Guardia.findOne({ where: { rut: entrega.rut_receptor } });
            if (guardia && guardia.email) {
                emailReceptor = guardia.email;
            }
        }

        // Agregar correo del receptor si existe
        if (emailReceptor) {
            destinatarios.push(emailReceptor);
            console.log(`Correo receptor encontrado: ${emailReceptor}`);
        } else {
            console.log(`No se encontró email para el receptor (RUT: ${entrega.rut_receptor})`);
        }

        // Filtrar duplicados y vacíos
        const listaCorreos = [...new Set(destinatarios)].join(',');

        if (!listaCorreos) {
            console.warn('No se encontraron destinatarios (ni supervisores ni receptor) para enviar notificación.');
            return;
        }

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Soporte Syseg'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: listaCorreos,
            subject: `[ENTREGA EPP] ${entrega.nombre_receptor} - ${new Date().toLocaleDateString()}`,
            html: `
                <h3>Notificación de Entrega de EPP</h3>
                <p>Se ha registrado una nueva entrega de EPP.</p>
                <ul>
                    <li><strong>Receptor:</strong> ${entrega.nombre_receptor}</li>
                    <li><strong>RUT:</strong> ${entrega.rut_receptor}</li>
                    <li><strong>Fecha:</strong> ${new Date(entrega.fecha_entrega).toLocaleString()}</li>
                </ul>
                <p>Se adjunta el comprobante firmado en formato PDF.</p>
            `,
            attachments: [
                {
                    filename: `Entrega_EPP_${entrega.rut_receptor}_${Date.now()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a: ${listaCorreos} - ID: ${info.messageId}`);
    } catch (error) {
        console.error("Error al enviar correo de notificación:", error);
    }
};