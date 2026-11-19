const request = require('supertest');

// Mockear la capa de datos
jest.mock('../src/db');
const db = require('../src/db');
const app = require('../src/app');

describe('Endpoints /libros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /libros', () => {
    it('debe devolver la lista de libros con status 200', async () => {
      const librosMock = [
        { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio_publicacion: 1967 },
        { id: 2, titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio_publicacion: 1944 }
      ];
      db.query.mockResolvedValueOnce([librosMock, []]);

      const res = await request(app).get('/libros');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].titulo).toBe('Cien años de soledad');
    });
  });

  describe('GET /libros/:id', () => {
    it('debe devolver el libro correspondiente cuando existe (200)', async () => {
      const libroMock = {
        id: 1,
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        anio_publicacion: 1605
      };
      db.query.mockResolvedValueOnce([[libroMock], []]);

      const res = await request(app).get('/libros/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(libroMock);
    });

    it('debe responder 404 al consultar un libro inexistente', async () => {
      db.query.mockResolvedValueOnce([[], []]); // Filas vacías

      const res = await request(app).get('/libros/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('no encontrado');
    });

    it('debe responder 400 si el ID no es numérico', async () => {
      const res = await request(app).get('/libros/abc');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /libros', () => {
    it('debe crear un libro válido y responder 201 con el registro creado', async () => {
      const nuevoLibro = {
        titulo: 'Rayuela',
        autor: 'Julio Cortázar',
        anio_publicacion: 1963
      };
      db.query.mockResolvedValueOnce([{ insertId: 10 }, []]);

      const res = await request(app)
        .post('/libros')
        .send(nuevoLibro);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 10);
      expect(res.body.titulo).toBe('Rayuela');
      expect(res.body.autor).toBe('Julio Cortázar');
      expect(res.body.anio_publicacion).toBe(1963);
    });

    it('debe responder 400 si el título está vacío', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: '   ', autor: 'Autor Valido', anio_publicacion: 2020 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('titulo');
    });

    it('debe responder 400 si el autor está ausente', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Titulo Valido', anio_publicacion: 2020 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('autor');
    });

    it('debe responder 400 si el anio_publicacion no es un entero válido', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Libro X', autor: 'Autor Y', anio_publicacion: 'dos mil veinte' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('anio_publicacion');
    });

    it('debe responder 400 si el anio_publicacion es negativo o cero', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Libro Antiguo', autor: 'Anonimo', anio_publicacion: -50 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('anio_publicacion');
    });
  });

  describe('PUT /libros/:id', () => {
    it('debe actualizar un libro existente y responder 200', async () => {
      // 1ra consulta: verificar existencia
      db.query.mockResolvedValueOnce([[{ id: 1 }], []]);
      // 2da consulta: UPDATE
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const res = await request(app)
        .put('/libros/1')
        .send({
          titulo: 'Cien años de soledad (Edición Conmemorativa)',
          autor: 'Gabriel García Márquez',
          anio_publicacion: 2007
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.titulo).toBe('Cien años de soledad (Edición Conmemorativa)');
    });

    it('debe responder 404 al intentar actualizar un libro inexistente', async () => {
      db.query.mockResolvedValueOnce([[], []]); // No existe

      const res = await request(app)
        .put('/libros/888')
        .send({
          titulo: 'Libro Fantasma',
          autor: 'Desconocido',
          anio_publicacion: 2020
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('no encontrado');
    });

    it('debe responder 400 ante datos inválidos en el PUT', async () => {
      const res = await request(app)
        .put('/libros/1')
        .send({ titulo: '', autor: 'Autor', anio_publicacion: 2020 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /libros/:id', () => {
    it('debe eliminar un libro existente y responder 200', async () => {
      // 1ra consulta: verificar existencia
      db.query.mockResolvedValueOnce([[{ id: 5 }], []]);
      // 2da consulta: DELETE
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const res = await request(app).delete('/libros/5');

      expect(res.statusCode).toBe(200);
      expect(res.body.mensaje).toContain('eliminado correctamente');
    });

    it('debe responder 404 al intentar eliminar un libro inexistente', async () => {
      db.query.mockResolvedValueOnce([[], []]); // No existe

      const res = await request(app).delete('/libros/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toContain('no encontrado');
    });
  });
});
