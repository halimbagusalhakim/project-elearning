const Class = require('../models/Class');
const ClassRegistration = require('../models/ClassRegistration');

const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.getAll();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createClass = async (req, res) => {
  const { nama_kelas, kode_kelas, deskripsi, guru_id } = req.body;

  try {
    // Determine the teacher ID: use provided guru_id if admin, otherwise use current user's ID
    const teacherId = req.user.role === 'admin' && guru_id ? guru_id : req.user.id;

    console.log('Creating class with data:', { nama_kelas, kode_kelas, deskripsi, guru_id: teacherId });

    const existingClass = await Class.findByCode(kode_kelas);
    if (existingClass) {
      return res.status(400).json({ error: 'Class code already exists' });
    }

    const classId = await Class.create({
      nama_kelas,
      kode_kelas,
      guru_id: teacherId,
      deskripsi
    });

    console.log('Class created successfully with ID:', classId);
    res.status(201).json({ id: classId, message: 'Class created successfully' });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const updateClass = async (req, res) => {
  const { nama_kelas, kode_kelas, deskripsi } = req.body;

  try {
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Allow admin to update any class, skip guru_id check for admin
    if (req.user.role !== 'admin' && existingClass.guru_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this class' });
    }

    const affectedRows = await Class.update(req.params.id, {
      nama_kelas,
      kode_kelas,
      deskripsi
    });

    res.json({ message: 'Class updated successfully', affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (existingClass.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this class' });
    }

    const affectedRows = await Class.delete(req.params.id);
    res.json({ message: 'Class deleted successfully', affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getTeacherClasses = async (req, res) => {
  try {
    console.log('Fetching classes for teacher ID:', req.user.id);
    const classes = await Class.getClassesByTeacher(req.user.id);

    console.log('Number of classes fetched:', classes.length);

    // For each class, get the count of approved students with error handling
    const classesWithStudentCount = await Promise.all(classes.map(async (cls) => {
      try {
        const approvedStudents = await ClassRegistration.getApprovedStudentsByClass(cls.id);
        return {
          ...cls,
          jumlah_siswa: approvedStudents.length
        };
      } catch (err) {
        console.error(`Error fetching approved students for class ID ${cls.id}:`, err);
        return {
          ...cls,
          jumlah_siswa: 0
        };
      }
    }));

    console.log('Classes fetched successfully:', classesWithStudentCount.length, 'classes found');
    res.json(classesWithStudentCount);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const getClassesByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;
    console.log('Fetching classes for teacher ID:', teacherId);
    const classes = await Class.getClassesByTeacher(teacherId);

    console.log('Number of classes fetched:', classes.length);

    // For each class, get the count of approved students with error handling
    const classesWithStudentCount = await Promise.all(classes.map(async (cls) => {
      try {
        const approvedStudents = await ClassRegistration.getApprovedStudentsByClass(cls.id);
        return {
          ...cls,
          jumlah_siswa: approvedStudents.length
        };
      } catch (err) {
        console.error(`Error fetching approved students for class ID ${cls.id}:`, err);
        return {
          ...cls,
          jumlah_siswa: 0
        };
      }
    }));

    console.log('Classes fetched successfully:', classesWithStudentCount.length, 'classes found');
    res.json(classesWithStudentCount);
  } catch (error) {
    console.error('Error fetching classes by teacher ID:', error);
    console.error(error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// Get pending registrations for a class
const getPendingRegistrations = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify that the class belongs to the teacher
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view registrations for this class' });
    }

    const pendingRegistrations = await ClassRegistration.getPendingRegistrationsByClass(classId);
    res.json(pendingRegistrations);
  } catch (error) {
    console.error('Error in getPendingRegistrations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get approved students for a class
const getApprovedStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify that the class belongs to the teacher
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view students for this class' });
    }

    const approvedStudents = await ClassRegistration.getApprovedStudentsByClass(classId);
    res.json(approvedStudents);
  } catch (error) {
    console.error('Error in getApprovedStudents:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve student registration
const approveRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get registration details
    const registration = await ClassRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Verify that the class belongs to the teacher
    const classData = await Class.findById(registration.kelas_id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to approve registrations for this class' });
    }

    const affectedRows = await ClassRegistration.updateStatus(registrationId, 'approved');
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration approved successfully' });
  } catch (error) {
    console.error('Error in approveRegistration:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reject student registration
const rejectRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get registration details
    const registration = await ClassRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Verify that the class belongs to the teacher
    const classData = await Class.findById(registration.kelas_id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to reject registrations for this class' });
    }

    const affectedRows = await ClassRegistration.updateStatus(registrationId, 'rejected');
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Registration rejected successfully' });
  } catch (error) {
    console.error('Error in rejectRegistration:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Student registers for a class
const registerForClass = async (req, res) => {
  try {
    const { kode_kelas } = req.body;

    if (req.user.role !== 'siswa') {
      return res.status(403).json({ error: 'Only students can register for classes' });
    }

    // Find class by code
    const classData = await Class.findByCode(kode_kelas);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if already registered
    const existingRegistration = await ClassRegistration.findByClassAndStudent(classData.id, req.user.id);
    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this class' });
    }

    // Create registration
    const registrationId = await ClassRegistration.create({
      kelas_id: classData.id,
      siswa_id: req.user.id,
      status: 'pending'
    });

    res.status(201).json({ 
      message: 'Registration submitted successfully. Waiting for teacher approval.',
      registrationId 
    });
  } catch (error) {
    console.error('Error in registerForClass:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove student from class
const removeStudent = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Get registration details
    const registration = await ClassRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Verify that the class belongs to the teacher
    const classData = await Class.findById(registration.kelas_id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classData.guru_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to remove students from this class' });
    }

    const affectedRows = await ClassRegistration.delete(registrationId);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ message: 'Student removed from class successfully' });
  } catch (error) {
    console.error('Error in removeStudent:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get student's class registrations
const getStudentRegistrations = async (req, res) => {
  try {
    if (req.user.role !== 'siswa') {
      return res.status(403).json({ error: 'Only students can view their registrations' });
    }

    const registrations = await ClassRegistration.getStudentRegistrations(req.user.id);
    res.json(registrations);
  } catch (error) {
    console.error('Error in getStudentRegistrations:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
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
};
