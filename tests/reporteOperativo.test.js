const request = require('supertest');
const app = require('../app');
const { sequelize, ReporteOperativo } = require('../models');

describe('Reporte Operativo API', () => {
  let server;

  beforeAll(async () => {
    await sequelize.sync({ alter: true });
  });

  afterAll(async () => {
    await sequelize.close();
    if (server && server.close) {
      server.close();
    }
  });

  it('rechaza creación sin token', async () => {
    const res = await request(app)
      .post('/api/reportes-operativos')
      .send({ tipo_incidente: 'prueba' });

    expect(res.status).toBe(403);
  });
});

