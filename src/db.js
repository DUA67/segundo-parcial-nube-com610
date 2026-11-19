const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'biblioteca_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

module.exports = {
  pool,
  // Helper para ejecutar consultas parametrizadas
  query: async (sql, params) => {
    return pool.query(sql, params);
  },
  // Verificación de conectividad
  testConnection: async () => {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  }
};
