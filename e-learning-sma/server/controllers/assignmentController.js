const Assignment = require('../models/Assignment');

const getAssignmentsByClass = async (req, res) => {
  try {
    const assignments = await Assignment.getByClassId(req.params.classId);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAssignmentsByTeacher = async (req, res) => {
  try {
    const assignments = await Assignment.getByTeacherId(req.user.id);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createAssignment = async (req, res) => {
  const { kelas_id, judul, deskripsi, deadline } = req.body;
  let file_path = null;
  let file_type = null;

  if (req.file) {
    file_path = '/uploads/' + req.file.filename;
    file_type = req.file.mimetype;
  }

  try {
    const assignmentId = await Assignment.create({
      kelas_id,
      judul,
      deskripsi,
      file_path,
      file_type,
      deadline,
      created_by: req.user.id
    });

    res.status(201).json({ id: assignmentId, message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateAssignment = async (req, res) => {
  const { judul, deskripsi, deadline } = req.body;
  let file_path;
  let file_type;

  try {
    const existingAssignment = await Assignment.findById(req.params.id);
    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (existingAssignment.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }

    // Only update file_path and file_type if a new file is uploaded
    if (req.file) {
      file_path = '/uploads/' + req.file.filename;
      file_type = req.file.mimetype;
    } else {
      file_path = existingAssignment.file_path;
      file_type = existingAssignment.file_type;
    }

    // Use existing values if fields are missing in the request body
    const updatedData = {
      judul: judul !== undefined ? judul : existingAssignment.judul,
      deskripsi: deskripsi !== undefined ? deskripsi : existingAssignment.deskripsi,
      file_path,
      file_type,
      deadline: deadline !== undefined ? deadline : existingAssignment.deadline,
    };

    const affectedRows = await Assignment.update(req.params.id, updatedData);

    res.json({ message: 'Assignment updated successfully', affectedRows });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const existingAssignment = await Assignment.findById(req.params.id);
    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (existingAssignment.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this assignment' });
    }

    const affectedRows = await Assignment.delete(req.params.id);
    res.json({ message: 'Assignment deleted successfully', affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getUpcomingAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.getUpcomingAssignments(10);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const getOverdueAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.getOverdueAssignments();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get assignments for a specific student
const getStudentAssignments = async (req, res) => {
  try {
    console.log('getStudentAssignments called for user:', {
      userId: req.user.id,
      userRole: req.user.role,
      userName: req.user.nama_lengkap
    });

    const assignments = await Assignment.getByStudentId(req.user.id);

    console.log('Assignments query result:', {
      assignmentsCount: assignments ? assignments.length : 0,
      assignments: assignments
    });

    if (!assignments || assignments.length === 0) {
      console.log('No assignments found for student, returning empty array');
      return res.json([]); // Return empty array if no assignments found
    }

    console.log('Returning assignments to client');
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// New controller method to get assignments with grades for a student filtered by class
const getStudentClassGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const classId = req.params.classId;

    const classGrades = await Assignment.getStudentClassStats(studentId, classId);

    // Return only the assignments array as expected by frontend
    res.json(classGrades.assignments || []);
  } catch (error) {
    console.error('Error fetching student class grades:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// New controller method to get all assignments (admin only)
const getAllAssignments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const assignments = await Assignment.getAll();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAssignmentsByClass,
  getAssignmentsByTeacher,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getUpcomingAssignments,
  getOverdueAssignments,
  getStudentAssignments,
  getStudentClassGrades,
  getAllAssignments
};

