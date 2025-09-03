const express = require('express');
const {
  getSubmissionsByAssignment,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission
} = require('../controllers/submissionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// GET /api/submissions/assignment/:assignmentId - Get submissions by assignment
router.get('/assignment/:assignmentId', authenticateToken, authorizeRoles('guru', 'admin'), getSubmissionsByAssignment);

// GET /api/submissions/:id - Get submission by ID
router.get('/:id', authenticateToken, getSubmissionById);

// POST /api/submissions - Create new submission (student only) with file upload
router.post('/', authenticateToken, authorizeRoles('siswa'), upload.any(), createSubmission);

// PUT /api/submissions/:id - Update submission (owner or teacher/admin) with file upload support
router.put('/:id', authenticateToken, upload.single('file'), updateSubmission);

// PUT /api/submissions/:id/grade - Grade submission (teacher/admin only)
router.put('/:id/grade', authenticateToken, authorizeRoles('guru', 'admin'), gradeSubmission);

// DELETE /api/submissions/:id - Delete submission (owner or teacher/admin)
router.delete('/:id', authenticateToken, deleteSubmission);

module.exports = router;
