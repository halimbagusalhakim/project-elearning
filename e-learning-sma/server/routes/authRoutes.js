const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, authController.changePassword);

// GET /api/auth/profile
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
