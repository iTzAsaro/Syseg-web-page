const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, Usuario, Permiso, Blacklist } = require('../models');

jest.setTimeout(30000);

describe('Blacklist permisos CRUD', () => {
  let viewerUser;
  let creatorUser;
  let editorUser;
  let deleterUser;
  let viewerToken;
  let creatorToken;
  let editorToken;
  let deleterToken;
  let createdRecord;

  const createToken = (usuario) => {
    return jwt.sign(
      { id: usuario.id, role: usuario.rol_id, type: 'usuario' },
      process.env.JWT_SECRET,
      { expiresIn: 3600 }
    );
  };

  const ensurePermission = async (codigo, descripcion) => {
    let permiso = await Permiso.findOne({ where: { codigo } });
    if (!permiso) {
      permiso = await Permiso.create({ codigo, descripcion });
    }
    return permiso;
  };

  beforeAll(async () => {
    await sequelize.sync({ alter: true });

    const ver = await ensurePermission('VER_BLACKLIST', 'Ver registros de blacklist');
    const crear = await ensurePermission('CREAR_BLACKLIST', 'Crear registros de blacklist');
    const editar = await ensurePermission('EDITAR_BLACKLIST', 'Editar registros de blacklist');
    const eliminar = await ensurePermission('ELIMINAR_BLACKLIST', 'Eliminar registros de blacklist');

    await Usuario.destroy({
      where: {
        email: [
          'viewer_blacklist@example.com',
          'creator_blacklist@example.com',
          'editor_blacklist@example.com',
          'deleter_blacklist@example.com'
        ]
      }
    });

    viewerUser = await Usuario.create({
      nombre: 'Viewer Blacklist',
      email: 'viewer_blacklist@example.com',
      password: '123456',
      estado: true,
      rol_id: 2
    });

    creatorUser = await Usuario.create({
      nombre: 'Creator Blacklist',
      email: 'creator_blacklist@example.com',
      password: '123456',
      estado: true,
      rol_id: 2
    });

    editorUser = await Usuario.create({
      nombre: 'Editor Blacklist',
      email: 'editor_blacklist@example.com',
      password: '123456',
      estado: true,
      rol_id: 2
    });

    deleterUser = await Usuario.create({
      nombre: 'Deleter Blacklist',
      email: 'deleter_blacklist@example.com',
      password: '123456',
      estado: true,
      rol_id: 2
    });

    await viewerUser.addPermiso(ver);
    await creatorUser.addPermiso(ver);
    await creatorUser.addPermiso(crear);
    await editorUser.addPermiso(ver);
    await editorUser.addPermiso(editar);
    await deleterUser.addPermiso(ver);
    await deleterUser.addPermiso(eliminar);

    viewerToken = createToken(viewerUser);
    creatorToken = createToken(creatorUser);
    editorToken = createToken(editorUser);
    deleterToken = createToken(deleterUser);
  });

  afterAll(async () => {
    if (createdRecord) {
      await Blacklist.destroy({ where: { id: createdRecord.id } });
    }
    await Usuario.destroy({ where: { email: ['viewer_blacklist@example.com', 'creator_blacklist@example.com', 'editor_blacklist@example.com', 'deleter_blacklist@example.com'] } });
  });

  it('permite GET /api/blacklist solo con VER_BLACKLIST y bloquea POST', async () => {
    const resList = await request(app)
      .get('/api/blacklist')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(resList.status).toBe(200);

    const resCreate = await request(app)
      .post('/api/blacklist')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        nombre: 'Solo Ver',
        rut: '33.333.333-3',
        recintos: 'Test',
        fecha_bloqueo: '2026-01-01',
        motivo: 'No debe crear'
      });

    expect(resCreate.status).toBe(403);
  });

  it('permite crear con CREAR_BLACKLIST', async () => {
    const resCreate = await request(app)
      .post('/api/blacklist')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        nombre: 'Puede Crear',
        rut: '44.444.444-4',
        recintos: 'Test Create',
        fecha_bloqueo: '2026-02-01',
        motivo: 'Prueba crear'
      });

    expect(resCreate.status).toBe(201);
    createdRecord = resCreate.body;
  });

  it('permite actualizar con EDITAR_BLACKLIST', async () => {
    const resUpdate = await request(app)
      .put(`/api/blacklist/${createdRecord.id}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        motivo: 'Motivo actualizado por editor'
      });

    expect(resUpdate.status).toBe(200);
  });

  it('permite eliminar con ELIMINAR_BLACKLIST', async () => {
    const resDelete = await request(app)
      .delete(`/api/blacklist/${createdRecord.id}`)
      .set('Authorization', `Bearer ${deleterToken}`);

    expect(resDelete.status).toBe(204);
  });
});
