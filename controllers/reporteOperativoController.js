const { ReporteOperativo, Guardia, Usuario } = require('../models');

exports.create = async (req, res) => {
  try {
    const {
      tipo_incidente,
      nivel_riesgo,
      fecha_evento,
      hora_evento,
      duracion_estimada,
      lugar,
      descripcion,
      funcionario_cargo,
      aviso_central,
      aviso_jefatura
    } = req.body;

    let guardia_id = null;
    let usuario_id = null;
    let creado_por_tipo = null;

    if (req.userType === 'guardia') {
      guardia_id = req.userId;
      creado_por_tipo = 'guardia';
    } else {
      usuario_id = req.userId || null;
      creado_por_tipo = 'usuario';
    }

    let ip_address = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
    if (ip_address === '::1' || ip_address === '::ffff:127.0.0.1') {
      ip_address = '127.0.0.1';
    }

    const reporte = await ReporteOperativo.create({
      guardia_id,
      usuario_id,
      tipo_incidente,
      nivel_riesgo,
      fecha_evento,
      hora_evento,
      duracion_estimada,
      lugar,
      descripcion,
      funcionario_cargo,
      aviso_central: !!aviso_central,
      aviso_jefatura: !!aviso_jefatura,
      creado_por_tipo,
      ip_address
    });

    res.status(201).json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const where = {};

    if (req.userType === 'guardia') {
      where.guardia_id = req.userId;
    } else {
      where.usuario_id = req.userId || null;
    }

    const reportes = await ReporteOperativo.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

