const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, Usuario, Blacklist } = require('../models');

describe('Blacklist API agregado_por', () => {
  let testUser;
  let token;

  beforeAll(async () => {
    await sequelize.sync({ alter: true });
    // Crear usuario de prueba
    testUser = await Usuario.create({
      nombre: 'Tester Uno',
      email: 'tester@example.com',
      password: '123456',
      estado: true,
      rol_id: 1 // Admin
    });
    token = jwt.sign({ id: testUser.id, role: 1, type: 'usuario' }, process.env.JWT_SECRET, { expiresIn: 3600 });
  });

  afterAll(async () => {
    // Cleanup: borrar registros creados
    await Blacklist.destroy({ where: { rut: '11.111.111-1' } });
    await testUser.destroy();
    await sequelize.close();
  });

  it('crea registro con agregado_por del usuario autenticado', async () => {
    const res = await request(app)
      .post('/api/blacklist')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Persona Bloqueada',
        rut: '11.111.111-1',
        recintos: 'FSP Test',
        fecha_bloqueo: '2026-01-01',
        motivo: 'Prueba auditoría'
      });

    expect(res.status).toBe(201);
    expect(res.body.agregado_por).toBe('Tester Uno');
    expect(res.body.agregado_por_id).toBe(testUser.id);
  });
}); 
