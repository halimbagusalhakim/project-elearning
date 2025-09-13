const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const logger = require('./utils/logger');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const materialRoutes = require('./routes/materialRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import models for table creation
const User = require('./models/User');
const Class = require('./models/Class');
const Material = require('./models/Material');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Learning SMA API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Creating users table...');
    await User.createTable();
    console.log('Users table created successfully');

    console.log('Creating classes table...');
    await Class.createTable();
    console.log('Classes table created successfully');

    console.log('Creating materials table...');
    await Material.createTable();
    console.log('Materials table created successfully');

    console.log('Creating assignments table...');
    await Assignment.createTable();
    console.log('Assignments table created successfully');

    console.log('Creating submissions table...');
    await Submission.createTable();
    console.log('Submissions table created successfully');

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw to handle in server.js
  }
};

module.exports = { app, initializeDatabase };
