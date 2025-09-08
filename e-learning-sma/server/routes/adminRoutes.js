const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemReports
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users - Get all users with pagination
router.get('/users', getAllUsers);

// PUT /api/admin/users/:userId/role - Update user role
router.put('/users/:userId/role', updateUserRole);

// DELETE /api/admin/users/:userId - Delete user
router.delete('/users/:userId', deleteUser);

// GET /api/admin/reports - Get system reports
router.get('/reports', getSystemReports);

module.exports = router;
