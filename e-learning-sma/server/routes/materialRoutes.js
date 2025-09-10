const express = require('express');
const {
  getMaterialsByClass,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getRecentMaterials,
  getStudentMaterials,
  getAllMaterials
} = require('../controllers/materialController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/class/:classId', getMaterialsByClass);

// GET /api/materials/all - Get all materials (admin only)
router.get('/all', authenticateToken, authorizeRoles('admin'), getAllMaterials);

// GET /api/materials/recent - Get recent materials
router.get('/recent', getRecentMaterials);

// GET /api/materials/student - Get materials for logged-in student
router.get('/student', authenticateToken, authorizeRoles('siswa'), getStudentMaterials);

// GET /api/materials/:id - Get material by ID
router.get('/:id', getMaterialById);

// POST /api/materials - Create new material (teacher/admin only) with file upload
router.post('/', authenticateToken, authorizeRoles('guru', 'admin'), upload.single('file'), createMaterial);

// PUT /api/materials/:id - Update material (owner or admin only) with file upload support
router.put('/:id', authenticateToken, upload.single('file'), updateMaterial);

// DELETE /api/materials/:id - Delete material (owner or admin only)
router.delete('/:id', authenticateToken, deleteMaterial);

module.exports = router;
