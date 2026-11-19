require('dotenv').config();
const app = require('./app');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Servidor de API Libros escuchando en puerto ${PORT}`);
  console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Endpoint de salud: http://localhost:${PORT}/health`);
  console.log(`===============================================`);
});

// Cierre graceful
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando servidor HTTP gracefully...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

module.exports = server;
