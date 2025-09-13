const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const register = async (req, res) => {
  const { username, email, password, nama_lengkap, kelas } = req.body;

  // Validate password length
  if (!password || password.length < 6 || password.length > 8) {
    return res.status(400).json({ error: 'Password harus memiliki panjang antara 6 hingga 8 karakter' });
  }

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashedPassword, role: 'siswa', nama_lengkap, kelas });
    logger.info(`New user registered: ${username} (ID: ${userId}, Email: ${email}) from IP: ${req.ip}`);
    res.status(201).json({ id: userId, username });
  } catch (error) {
    logger.error(`Registration error for username: ${username} - ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Failed login attempt for username: ${username} from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    logger.info(`Successful login for user: ${username} (ID: ${user.id}, Role: ${user.role}) from IP: ${req.ip}`);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    logger.error(`Login error for username: ${username} - ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAuthenticatedUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      id: req.user.id,
      nama_lengkap: req.user.nama_lengkap,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validate new password length
  if (!newPassword || newPassword.length < 6 || newPassword.length > 8) {
    return res.status(400).json({ error: 'Password baru harus memiliki panjang antara 6 hingga 8 karakter' });
  }

  try {
    // Get user from database to verify current password
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Trim passwords to avoid whitespace issues
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(trimmedCurrentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password
    const updated = await User.updatePassword(userId, hashedNewPassword);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_lengkap, username, email } = req.body;

    // Validate input as needed
    if (!nama_lengkap || !username || !email) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    // Update the profile
    const updated = await User.updateProfile(userId, { nama_lengkap, username, email });
    if (!updated) {
      return res.status(500).json({ error: 'Gagal memperbarui profil' });
    }

    // Fetch the updated user data
    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  register,
  login,
  getAuthenticatedUser,
  changePassword,
  getProfile,
  updateProfile
};
