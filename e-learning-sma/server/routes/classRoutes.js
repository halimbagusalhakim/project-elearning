const express = require('express');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getTeacherClasses,
  getClassesByTeacherId,
  getPendingRegistrations,
  getApprovedStudents,
  approveRegistration,
  rejectRegistration,
  registerForClass,
  getStudentRegistrations,
  removeStudent
} = require('../controllers/classController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/classes - Get all classes
router.get('/', getAllClasses);

// GET /api/classes/teacher - Get teacher's classes
router.get('/teacher', authenticateToken, authorizeRoles('guru', 'admin'), getTeacherClasses);

// GET /api/classes/teacher/:teacherId - Get classes by teacher ID (admin only)
router.get('/teacher/:teacherId', authenticateToken, authorizeRoles('admin'), getClassesByTeacherId);

// GET /api/classes/:id - Get class by ID
router.get('/:id', getClassById);

// POST /api/classes - Create new class (teacher/admin only)
router.post('/', authenticateToken, authorizeRoles('guru', 'admin'), createClass);

// PUT /api/classes/:id - Update class (owner or admin only)
router.put('/:id', authenticateToken, updateClass);

// DELETE /api/classes/:id - Delete class (owner or admin only)
router.delete('/:id', authenticateToken, deleteClass);

// Student registration endpoints
// POST /api/classes/register - Student registers for a class
router.post('/register', authenticateToken, registerForClass);

// GET /api/classes/student/registrations - Get student's class registrations
router.get('/student/registrations', authenticateToken, getStudentRegistrations);

// Teacher registration management endpoints
// GET /api/classes/:classId/registrations/pending - Get pending registrations for a class
router.get('/:classId/registrations/pending', authenticateToken, authorizeRoles('guru', 'admin'), getPendingRegistrations);

// GET /api/classes/:classId/students/approved - Get approved students for a class
router.get('/:classId/students/approved', authenticateToken, authorizeRoles('guru', 'admin'), getApprovedStudents);

// PUT /api/classes/registrations/:registrationId/approve - Approve student registration
router.put('/registrations/:registrationId/approve', authenticateToken, authorizeRoles('guru', 'admin'), approveRegistration);

// PUT /api/classes/registrations/:registrationId/reject - Reject student registration
router.put('/registrations/:registrationId/reject', authenticateToken, authorizeRoles('guru', 'admin'), rejectRegistration);

// DELETE /api/classes/registrations/:registrationId - Remove student from class
router.delete('/registrations/:registrationId', authenticateToken, authorizeRoles('guru', 'admin'), removeStudent);

module.exports = router;
