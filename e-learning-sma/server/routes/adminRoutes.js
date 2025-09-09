const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUser,
  deleteUser,
  getSystemReports,
  createUser,
  getTeachers
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users - Get all users with pagination
router.get('/users', getAllUsers);

// POST /api/admin/users - Create new user
router.post('/users', createUser);

// PUT /api/admin/users/:userId - Update user
router.put('/users/:userId', updateUser);

// PUT /api/admin/users/:userId/role - Update user role
router.put('/users/:userId/role', updateUserRole);

// DELETE /api/admin/users/:userId - Delete user
router.delete('/users/:userId', deleteUser);

// GET /api/admin/reports - Get system reports
router.get('/reports', getSystemReports);

// GET /api/admin/teachers - Get all teachers
router.get('/teachers', getTeachers);

module.exports = router;
