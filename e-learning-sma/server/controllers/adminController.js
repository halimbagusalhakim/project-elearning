const User = require('../models/User');
const Class = require('../models/Class');
const Material = require('../models/Material');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    // Get total counts
    const totalUsersResult = await User.getTotalCount();
    console.log('Total users result:', totalUsersResult);
    const totalUsers = totalUsersResult[0]?.total || 0;

    const totalClassesResult = await Class.getTotalCount();
    console.log('Total classes result:', totalClassesResult);
    const totalClasses = totalClassesResult[0]?.total || 0;

    const totalMaterialsResult = await Material.getTotalCount();
    console.log('Total materials result:', totalMaterialsResult);
    const totalMaterials = totalMaterialsResult[0]?.total || 0;

    const totalAssignmentsResult = await Assignment.getTotalCount();
    console.log('Total assignments result:', totalAssignmentsResult);
    const totalAssignments = totalAssignmentsResult[0]?.total || 0;

    const totalSubmissionsResult = await Submission.getTotalCount();
    console.log('Total submissions result:', totalSubmissionsResult);
    const totalSubmissions = totalSubmissionsResult[0]?.total || 0;

    // Get user counts by role
    const userStats = await User.getUserStatsByRole();
    console.log('User stats result:', userStats);

    // Get recent activities (last 10)
    const recentUsers = await User.getRecentUsers(5);
    const recentClasses = await Class.getRecentClasses(5);
    const recentMaterials = await Material.getRecentMaterials(5);

    res.json({
      stats: {
        totalUsers,
        totalClasses,
        totalMaterials,
        totalAssignments,
        totalSubmissions,
        userStats
      },
      recent: {
        users: recentUsers,
        classes: recentClasses,
        materials: recentMaterials
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users with pagination and optional filtering by role and username
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { role, username } = req.query;

    // Build dynamic WHERE clause based on filters
    let whereClauses = [];
    let params = [];

    if (role) {
      whereClauses.push('role = ?');
      params.push(role);
    }
    if (username) {
      whereClauses.push('username LIKE ?');
      params.push(`%${username}%`);
    }

    let whereSQL = '';
    if (whereClauses.length > 0) {
      whereSQL = ' WHERE ' + whereClauses.join(' AND ');
    }

    // Query total count with filters
    const countSQL = `SELECT COUNT(*) as total FROM users${whereSQL}`;
    const [countRows] = await db.promise().execute(countSQL, params);
    const total = countRows[0]?.total || 0;

    // Query users with filters and pagination
    const usersSQL = `SELECT id, username, email, role, nama_lengkap, kelas, created_at FROM users${whereSQL} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [users] = await db.promise().execute(usersSQL, params);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['siswa', 'guru', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const affectedRows = await User.updateRole(userId, role);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user (full user data)
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, role, nama_lengkap, kelas } = req.body;

  // Validate required fields
  if (!username || !email || !role || !nama_lengkap) {
    return res.status(400).json({ error: 'Username, email, role, and nama_lengkap are required' });
  }

  // Validate role
  if (!['siswa', 'guru', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be siswa, guru, or admin' });
  }

  try {
    // Check if username already exists (excluding current user)
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id != userId) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists (excluding current user)
    const existingEmail = await User.findByEmail(email);
    if (existingEmail && existingEmail.id != userId) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Update the user
    const success = await User.updateUser(userId, { username, email, role, nama_lengkap, kelas });
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const affectedRows = await User.delete(userId);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get system reports
const getSystemReports = async (req, res) => {
  try {
    // Get class statistics
    const classStats = await Class.getClassStatistics();

    // Get assignment statistics
    const assignmentStats = await Assignment.getAssignmentStatistics();

    // Get submission statistics
    const submissionStats = await Submission.getSubmissionStatistics();

    res.json({
      classStats,
      assignmentStats,
      submissionStats
    });
  } catch (error) {
    console.error('Error fetching system reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  const { username, email, password, role, nama_lengkap, kelas } = req.body;

  // Validate required fields
  if (!username || !email || !password || !role || !nama_lengkap) {
    return res.status(400).json({ error: 'Username, email, password, role, and nama_lengkap are required' });
  }

  // Validate role
  if (!['siswa', 'guru'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either siswa or guru' });
  }

  // Validate password length
  if (!password || password.length < 6 || password.length > 8) {
    return res.status(400).json({ error: 'Password harus memiliki panjang antara 6 hingga 8 karakter' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const userId = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      nama_lengkap,
      kelas: kelas || null
    });

    res.status(201).json({
      id: userId,
      username,
      email,
      role,
      nama_lengkap,
      kelas,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.getUsersByRole('guru');
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUser,
  deleteUser,
  getSystemReports,
  createUser,
  getTeachers
};
