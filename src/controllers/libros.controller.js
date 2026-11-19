const db = require('../db');

/**
 * Valida los datos recibidos para creación o edición de un libro.
 * Retorna un string con el mensaje de error o null si es válido.
 */
function validarDatosLibro(data) {
  const { titulo, autor, anio_publicacion } = data;

  if (titulo === undefined || titulo === null || typeof titulo !== 'string' || titulo.trim() === '') {
    return 'El campo "titulo" es requerido y no puede estar vacío.';
  }

  if (autor === undefined || autor === null || typeof autor !== 'string' || autor.trim() === '') {
    return 'El campo "autor" es requerido y no puede estar vacío.';
  }

  const anio = Number(anio_publicacion);
  if (
    anio_publicacion === undefined ||
    anio_publicacion === null ||
    !Number.isInteger(anio) ||
    isNaN(anio) ||
    anio <= 0 ||
    anio > 2100
  ) {
    return 'El campo "anio_publicacion" debe ser un número entero positivo válido.';
  }

  return null;
}

// GET /libros - Listar todos los libros
const obtenerLibros = async (req, res) => {
  try {
    const [filas] = await db.query(
      'SELECT id, titulo, autor, anio_publicacion, created_at, updated_at FROM libros ORDER BY id ASC'
    );
    return res.status(200).json(filas);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al consultar los libros.'
    });
  }
};

// GET /libros/:id - Obtener un libro por ID
const obtenerLibroPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID proporcionado debe ser un número entero positivo.' });
    }

    const [filas] = await db.query(
      'SELECT id, titulo, autor, anio_publicacion, created_at, updated_at FROM libros WHERE id = ?',
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ error: `Libro con ID ${id} no encontrado.` });
    }

    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error('Error al obtener libro por ID:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al consultar el libro.'
    });
  }
};

// POST /libros - Crear un nuevo libro
const crearLibro = async (req, res) => {
  try {
    const { titulo, autor, anio_publicacion } = req.body;

    const errorValidacion = validarDatosLibro({ titulo, autor, anio_publicacion });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const tituloLimpio = titulo.trim();
    const autorLimpio = autor.trim();
    const anio = parseInt(anio_publicacion, 10);

    const [resultado] = await db.query(
      'INSERT INTO libros (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
      [tituloLimpio, autorLimpio, anio]
    );

    const nuevoLibro = {
      id: resultado.insertId,
      titulo: tituloLimpio,
      autor: autorLimpio,
      anio_publicacion: anio
    };

    return res.status(201).json(nuevoLibro);
  } catch (error) {
    console.error('Error al crear libro:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al registrar el libro.'
    });
  }
};

// PUT /libros/:id - Actualizar un libro existente
const actualizarLibro = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID proporcionado debe ser un número entero positivo.' });
    }

    const { titulo, autor, anio_publicacion } = req.body;
    const errorValidacion = validarDatosLibro({ titulo, autor, anio_publicacion });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const tituloLimpio = titulo.trim();
    const autorLimpio = autor.trim();
    const anio = parseInt(anio_publicacion, 10);

    // Verificar si el libro existe
    const [existente] = await db.query('SELECT id FROM libros WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: `Libro con ID ${id} no encontrado.` });
    }

    // Actualizar registro
    await db.query(
      'UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ? WHERE id = ?',
      [tituloLimpio, autorLimpio, anio, id]
    );

    const libroActualizado = {
      id,
      titulo: tituloLimpio,
      autor: autorLimpio,
      anio_publicacion: anio
    };

    return res.status(200).json(libroActualizado);
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al actualizar el libro.'
    });
  }
};

// DELETE /libros/:id - Eliminar un libro
const eliminarLibro = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El ID proporcionado debe ser un número entero positivo.' });
    }

    // Verificar existencia
    const [existente] = await db.query('SELECT id FROM libros WHERE id = ?', [id]);
    if (existente.length === 0) {
      return res.status(404).json({ error: `Libro con ID ${id} no encontrado.` });
    }

    await db.query('DELETE FROM libros WHERE id = ?', [id]);

    return res.status(200).json({
      mensaje: `Libro con ID ${id} eliminado correctamente.`
    });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    return res.status(500).json({
      error: 'Error interno del servidor al eliminar el libro.'
    });
  }
};

module.exports = {
  obtenerLibros,
  obtenerLibroPorId,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  validarDatosLibro
};
