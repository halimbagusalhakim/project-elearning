const express = require('express');
const {
  getAssignmentsByClass,
  getAssignmentsByTeacher,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
  getOverdueAssignments,

  getStudentAssignments,
  getStudentClassGrades
} = require('../controllers/assignmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// GET /api/assignments/class/:classId - Get assignments by class
router.get('/class/:classId', getAssignmentsByClass);

// GET /api/assignments/teacher - Get assignments by teacher
router.get('/teacher', authenticateToken, authorizeRoles('guru', 'admin'), getAssignmentsByTeacher);

// GET /api/assignments/upcoming - Get upcoming assignments
router.get('/upcoming', getUpcomingAssignments);

// GET /api/assignments/overdue - Get overdue assignments
router.get('/overdue', getOverdueAssignments);

// GET /api/assignments/student - Get assignments for current student
router.get('/student', authenticateToken, authorizeRoles('siswa'), getStudentAssignments);

// GET /api/assignments/student/class/:classId - Get assignments with grades for student filtered by class
router.get('/student/class/:classId', authenticateToken, authorizeRoles('siswa'), getStudentClassGrades);





// GET /api/assignments/:id - Get assignment by ID (must be last to avoid conflicts)
router.get('/:id', getAssignmentById);

// POST /api/assignments - Create new assignment (teacher/admin only) with file upload
router.post('/', authenticateToken, authorizeRoles('guru', 'admin'), upload.single('file'), createAssignment);

// PUT /api/assignments/:id - Update assignment (owner or admin only) with file upload support
router.put('/:id', authenticateToken, upload.single('file'), updateAssignment);

// DELETE /api/assignments/:id - Delete assignment (owner or admin only)
router.delete('/:id', authenticateToken, deleteAssignment);

module.exports = router;
