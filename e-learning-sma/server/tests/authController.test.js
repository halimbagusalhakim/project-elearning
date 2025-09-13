const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 1 },
      ip: '127.0.0.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { username: 'testuser', email: 'test@example.com', password: '123456', nama_lengkap: 'Test User', kelas: '10A' };
      User.findByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      User.create.mockResolvedValue(1);

      await authController.register(req, res);

      expect(User.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
    });

    it('should return 400 if password length is invalid', async () => {
      req.body = { password: '123' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password harus memiliki panjang antara 6 hingga 8 karakter' });
    });

    it('should return 400 if username already exists', async () => {
      req.body = { username: 'testuser', password: '123456' };
      User.findByUsername.mockResolvedValue({ id: 1 });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
    });

    it('should handle server error', async () => {
      req.body = { username: 'testuser', password: '123456' };
      User.findByUsername.mockRejectedValue(new Error('DB error'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      req.body = { username: 'testuser', password: '123456' };
      const user = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'siswa' };
      User.findByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await authController.login(req, res);

      expect(User.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        token: 'token',
        user: { id: 1, username: 'testuser', role: 'siswa' }
      });
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = { username: 'testuser', password: 'wrongpass' };
      User.findByUsername.mockResolvedValue({ password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should handle server error', async () => {
      req.body = { username: 'testuser', password: '123456' };
      User.findByUsername.mockRejectedValue(new Error('DB error'));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return authenticated user data', async () => {
      req.user = { id: 1, nama_lengkap: 'Test User', email: 'test@example.com', role: 'siswa' };

      await authController.getAuthenticatedUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        nama_lengkap: 'Test User',
        email: 'test@example.com',
        role: 'siswa'
      });
    });

    it('should return 401 if not authenticated', async () => {
      req.user = null;

      await authController.getAuthenticatedUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should handle server error', async () => {
      req.user = { id: 1 };
      // Force error by throwing in res.json
      res.json = jest.fn(() => { throw new Error('Test error'); });

      await authController.getAuthenticatedUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      req.user.id = 1;
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      const user = { password: 'hashedoldpass' };
      User.findByIdWithPassword.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashednewpass');
      User.updatePassword.mockResolvedValue(true);

      await authController.changePassword(req, res);

      expect(User.findByIdWithPassword).toHaveBeenCalledWith(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'hashedoldpass');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(User.updatePassword).toHaveBeenCalledWith(1, 'hashednewpass');
      expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
    });

    it('should return 400 if new password length is invalid', async () => {
      req.body = { newPassword: '123' };

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password baru harus memiliki panjang antara 6 hingga 8 karakter' });
    });

    it('should return 400 if current password is incorrect', async () => {
      req.user.id = 1;
      req.body = { currentPassword: 'wrongpass', newPassword: 'newpass' };
      const user = { password: 'hashedoldpass' };
      User.findByIdWithPassword.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Current password is incorrect' });
    });

    it('should return 404 if user not found', async () => {
      req.user.id = 1;
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      User.findByIdWithPassword.mockResolvedValue(null);

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle server error', async () => {
      req.user.id = 1;
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      User.findByIdWithPassword.mockRejectedValue(new Error('DB error'));

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      req.user.id = 1;
      const user = { id: 1, username: 'testuser' };
      User.findById.mockResolvedValue(user);

      await authController.getProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 if user not found', async () => {
      req.user.id = 1;
      User.findById.mockResolvedValue(null);

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User tidak ditemukan' });
    });

    it('should handle server error', async () => {
      req.user.id = 1;
      User.findById.mockRejectedValue(new Error('DB error'));

      await authController.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Terjadi kesalahan server' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      req.user.id = 1;
      req.body = { nama_lengkap: 'Test User', username: 'testuser', email: 'test@example.com' };
      User.updateProfile.mockResolvedValue(true);
      User.findById.mockResolvedValue({ id: 1, username: 'testuser' });

      await authController.updateProfile(req, res);

      expect(User.updateProfile).toHaveBeenCalledWith(1, { nama_lengkap: 'Test User', username: 'testuser', email: 'test@example.com' });
      expect(User.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { nama_lengkap: '', username: '', email: '' };

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Semua field harus diisi' });
    });

    it('should return 500 if update fails', async () => {
      req.user.id = 1;
      req.body = { nama_lengkap: 'Test User', username: 'testuser', email: 'test@example.com' };
      User.updateProfile.mockResolvedValue(false);

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Gagal memperbarui profil' });
    });

    it('should return 404 if user not found after update', async () => {
      req.user.id = 1;
      req.body = { nama_lengkap: 'Test User', username: 'testuser', email: 'test@example.com' };
      User.updateProfile.mockResolvedValue(true);
      User.findById.mockResolvedValue(null);

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User tidak ditemukan' });
    });

    it('should handle server error', async () => {
      req.user.id = 1;
      req.body = { nama_lengkap: 'Test User', username: 'testuser', email: 'test@example.com' };
      User.updateProfile.mockRejectedValue(new Error('DB error'));

      await authController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Terjadi kesalahan server' });
    });
  });
});
