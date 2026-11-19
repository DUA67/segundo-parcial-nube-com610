const request = require('supertest');

// Mockear la capa de datos antes de importar la app
jest.mock('../src/db', () => ({
  testConnection: jest.fn().mockResolvedValue(true),
  query: jest.fn()
}));

const app = require('../src/app');

describe('GET /health', () => {
  it('debe responder 200 y confirmar que el servicio está activo', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'api-libros-cloud');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('debe indicar database: unreachable si falla la conexión pero seguir respondiendo 200 al healthcheck', async () => {
    const db = require('../src/db');
    db.testConnection.mockRejectedValueOnce(new Error('Connection timeout'));

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('unreachable');
  });
});
