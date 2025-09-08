const User = require('../models/User');
const Class = require('../models/Class');
const Material = require('../models/Material');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

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

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await User.getAllWithPagination(limit, offset);
    const [totalCount] = await User.getTotalCount();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount.total,
        totalPages: Math.ceil(totalCount.total / limit)
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemReports
};
