const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, Usuario, Blacklist } = require('../models');

describe('Blacklist integridad agregado_por tras eliminar usuario', () => {
  let tempUser;
  let token;
  let adminReader;
  let adminToken;
  let created;

  beforeAll(async () => {
    await sequelize.sync({ alter: true });
    tempUser = await Usuario.create({
      nombre: 'Integridad Tester',
      email: 'integridad@example.com',
      password: '123456',
      estado: true,
      rol_id: 1
    });
    token = jwt.sign({ id: tempUser.id, role: 1, type: 'usuario' }, process.env.JWT_SECRET, { expiresIn: 3600 });

    adminReader = await Usuario.create({
      nombre: 'Admin Reader',
      email: 'reader@example.com',
      password: '123456',
      estado: true,
      rol_id: 1
    });
    adminToken = jwt.sign({ id: adminReader.id, role: 1, type: 'usuario' }, process.env.JWT_SECRET, { expiresIn: 3600 });
  });

  afterAll(async () => {
    if (created) await Blacklist.destroy({ where: { id: created.id } });
    // limpiar admin reader
    if (adminReader) await adminReader.destroy();
    // usuario ya eliminado en el test
    await sequelize.close();
  });

  it('preserva nombre agregado_por y setea agregado_por_id a NULL al eliminar usuario', async () => {
    const resCreate = await request(app)
      .post('/api/blacklist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Persona X',
        rut: '22.222.222-2',
        recintos: 'FSP Test',
        fecha_bloqueo: '2026-01-01',
        motivo: 'Integridad test'
      });
    expect(resCreate.status).toBe(201);
    created = resCreate.body;
    expect(created.agregado_por).toBe('Integridad Tester');
    expect(created.agregado_por_id).toBe(tempUser.id);

    // Eliminar usuario
    await tempUser.destroy();

    // Consultar nuevamente registro
    const resList = await request(app)
      .get('/api/blacklist')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resList.status).toBe(200);
    const found = resList.body.find(r => r.id === created.id);
    expect(found).toBeTruthy();
    expect(found.agregado_por).toBe('Integridad Tester');
    expect(found.agregado_por_id).toBeNull();
  });
});
