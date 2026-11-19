const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /health
router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await db.testConnection();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'unreachable';
  }

  // Estado general del servicio
  return res.status(200).json({
    status: 'ok',
    service: 'api-libros-cloud',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

module.exports = router;
