const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const librosRoutes = require('./routes/libros.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/health', healthRoutes);
app.use('/libros', librosRoutes);

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'API de Gestión de Libros en AWS (COM610)',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: [
      'GET /health',
      'GET /libros',
      'GET /libros/:id',
      'POST /libros',
      'PUT /libros/:id',
      'DELETE /libros/:id'
    ]
  });
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ error: 'Error interno inesperado en el servidor' });
});

module.exports = app;
