const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Get attendance for a class on a specific date
router.get('/class/:classId', authMiddleware, attendanceController.getAttendanceByClassAndDate);

// Get attendance stats for a class
router.get('/class/:classId/stats', authMiddleware, attendanceController.getAttendanceStats);

// Get students without attendance for a specific date
router.get('/class/:classId/missing', authMiddleware, attendanceController.getStudentsWithoutAttendance);

// Get student's own attendance for a class
router.get('/student/:classId', authMiddleware, attendanceController.getStudentAttendance);

// Mark attendance for multiple students
router.post('/class/:classId/mark', authMiddleware, attendanceController.markAttendance);

// Update a specific attendance record
router.put('/:attendanceId', authMiddleware, attendanceController.updateAttendanceRecord);

module.exports = router;
