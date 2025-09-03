const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'e_learning_sma',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    console.error('Connection details:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'e_learning_sma'
    });
    process.exit(1);
  }
  console.log('Connected to MySQL database successfully');
});

// Handle connection errors
connection.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to database...');
    connection.connect();
  } else {
    throw err;
  }
});

module.exports = connection;
