const sequelize = require('../config/database');

const Rol = require('./Rol');
const Permiso = require('./Permiso');
const TipoDocumento = require('./TipoDocumento');
const Categoria = require('./Categoria');
const Region = require('./Region');
const Afp = require('./Afp');
const SistemaSalud = require('./SistemaSalud');
const Usuario = require('./Usuario');
const Comuna = require('./Comuna');
const Local = require('./Local');
const Producto = require('./Producto');
const Guardia = require('./Guardia');
const UsuarioPermiso = require('./UsuarioPermiso');
const DocumentoGuardia = require('./DocumentoGuardia');
const MovimientoInventario = require('./MovimientoInventario');
const EstadoCivil = require('./EstadoCivil');
const TipoMovimiento = require('./TipoMovimiento');
const UsuarioRegion = require('./UsuarioRegion');
const Bitacora = require('./Bitacora');
const Asignacion = require('./Asignacion');
const Blacklist = require('./Blacklist');
const Auditoria = require('./Auditoria');
const EntregaEpp = require('./EntregaEpp');
const DetalleEntregaEpp = require('./DetalleEntregaEpp');
const ReporteOperativo = require('./ReporteOperativo');

// Asociaciones

// Rol - Usuario (Rol define permisos -> Usuario)
Rol.hasMany(Usuario, { foreignKey: 'rol_id' });
Usuario.belongsTo(Rol, { foreignKey: 'rol_id' });

// Usuario - Permiso (tiene extras)
Usuario.belongsToMany(Permiso, { through: UsuarioPermiso, foreignKey: 'usuario_id' });
Permiso.belongsToMany(Usuario, { through: UsuarioPermiso, foreignKey: 'permiso_id' });

// Usuario - Region (supervisa) - A través de tabla intermedia UsuarioRegion
Usuario.belongsToMany(Region, { through: UsuarioRegion, foreignKey: 'usuario_id' });
Region.belongsToMany(Usuario, { through: UsuarioRegion, foreignKey: 'region_id' });

// Region - Comuna (compone)
Region.hasMany(Comuna, { foreignKey: 'region_id' });
Comuna.belongsTo(Region, { foreignKey: 'region_id' });

// Comuna - Local (ubica)
Comuna.hasMany(Local, { foreignKey: 'comuna_id' });
Local.belongsTo(Comuna, { foreignKey: 'comuna_id' });

// Comuna - Guardia (residencia)
Comuna.hasMany(Guardia, { foreignKey: 'comuna_id' });
Guardia.belongsTo(Comuna, { foreignKey: 'comuna_id' });

// Guardia - DocumentoGuardia (posee)
Guardia.hasMany(DocumentoGuardia, { foreignKey: 'guardia_id' });
DocumentoGuardia.belongsTo(Guardia, { foreignKey: 'guardia_id' });

// TipoDocumento - DocumentoGuardia (clasifica)
TipoDocumento.hasMany(DocumentoGuardia, { foreignKey: 'tipo_documento_id' });
DocumentoGuardia.belongsTo(TipoDocumento, { foreignKey: 'tipo_documento_id' });

// Categoria - Producto (agrupa)
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Producto - MovimientoInventario (historial)
Producto.hasMany(MovimientoInventario, { foreignKey: 'producto_id' });
MovimientoInventario.belongsTo(Producto, { foreignKey: 'producto_id' });

// Usuario - MovimientoInventario (registra)
Usuario.hasMany(MovimientoInventario, { foreignKey: 'usuario_id' });
MovimientoInventario.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// DocumentoGuardia - MovimientoInventario (justifica entrega EPP)
// DocumentoGuardia.hasMany(MovimientoInventario, { foreignKey: 'documento_asociado_id' });
// MovimientoInventario.belongsTo(DocumentoGuardia, { foreignKey: 'documento_asociado_id' });

// Guardia - MovimientoInventario (Destinatario del movimiento/retiro)
Guardia.hasMany(MovimientoInventario, { foreignKey: 'documento_asociado_id' });
MovimientoInventario.belongsTo(Guardia, { foreignKey: 'documento_asociado_id' });

// Guardia - AFP
Afp.hasMany(Guardia, { foreignKey: 'afp_id' });
Guardia.belongsTo(Afp, { foreignKey: 'afp_id' });

// Guardia - SistemaSalud
SistemaSalud.hasMany(Guardia, { foreignKey: 'salud_id' });
Guardia.belongsTo(SistemaSalud, { foreignKey: 'salud_id' });

// Guardia - EstadoCivil
EstadoCivil.hasMany(Guardia, { foreignKey: 'civil_id' });
Guardia.belongsTo(EstadoCivil, { foreignKey: 'civil_id' });

// TipoMovimiento - MovimientoInventario
TipoMovimiento.hasMany(MovimientoInventario, { foreignKey: 'tipo_movimiento_id' });
MovimientoInventario.belongsTo(TipoMovimiento, { foreignKey: 'tipo_movimiento_id' });

// Usuario - Bitacora (auditoría)
Usuario.hasMany(Bitacora, { foreignKey: 'usuario_id' });
Bitacora.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Guardia - Asignacion
Guardia.hasMany(Asignacion, { foreignKey: 'guardia_id' });
Asignacion.belongsTo(Guardia, { foreignKey: 'guardia_id' });

// Local - Asignacion
Local.hasMany(Asignacion, { foreignKey: 'local_id' });
Asignacion.belongsTo(Local, { foreignKey: 'local_id' });

// Usuario - Auditoria
Usuario.hasMany(Auditoria, { foreignKey: 'usuario_id' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Entrega EPP Relaciones
EntregaEpp.belongsTo(Usuario, { as: 'receptor', foreignKey: 'usuario_id' });
EntregaEpp.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });
EntregaEpp.hasMany(DetalleEntregaEpp, { foreignKey: 'entrega_id' });
DetalleEntregaEpp.belongsTo(EntregaEpp, { foreignKey: 'entrega_id' });
DetalleEntregaEpp.belongsTo(Producto, { foreignKey: 'producto_id' });

// Reporte Operativo Relaciones
ReporteOperativo.belongsTo(Guardia, { foreignKey: 'guardia_id' });
ReporteOperativo.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
    sequelize,
    Rol,
    Permiso,
    TipoDocumento,
    Categoria,
    Region,
    Afp,
    SistemaSalud,
    Usuario,
    Comuna,
    Local,
    Producto,
    Guardia,
    UsuarioPermiso,
    DocumentoGuardia,
    MovimientoInventario,
    EstadoCivil,
    TipoMovimiento,
    UsuarioRegion,
    Bitacora,
    Asignacion,
    Blacklist,
    Auditoria,
    EntregaEpp,
    DetalleEntregaEpp,
    ReporteOperativo
};
