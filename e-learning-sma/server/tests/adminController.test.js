const adminController = require('../controllers/adminController');
const User = require('../models/User');

// Mock the User model methods
jest.mock('../models/User');

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 1, role: 'admin' },
      params: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics successfully', async () => {
      // Mock the User model methods
      User.getTotalCount.mockResolvedValue([{ total: 150 }]);
      User.getUserStatsByRole.mockResolvedValue([
        { role: 'siswa', count: 120 },
        { role: 'guru', count: 25 },
        { role: 'admin', count: 5 }
      ]);

      await adminController.getDashboardStats(req, res);

      expect(User.getTotalCount).toHaveBeenCalled();
      expect(User.getUserStatsByRole).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        totalUsers: 150,
        userStats: [
          { role: 'siswa', count: 120 },
          { role: 'guru', count: 25 },
          { role: 'admin', count: 5 }
        ]
      });
    });

    it('should handle errors', async () => {
      User.getTotalCount.mockRejectedValue(new Error('Database error'));

      await adminController.getDashboardStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch dashboard statistics'
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', role: 'siswa' },
        { id: 2, username: 'user2', role: 'guru' }
      ];

      User.getAllWithPagination.mockResolvedValue(mockUsers);

      req.query = { limit: '10', offset: '0' };

      await adminController.getAllUsers(req, res);

      expect(User.getAllWithPagination).toHaveBeenCalledWith(10, 0);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should use default pagination values', async () => {
      const mockUsers = [{ id: 1, username: 'user1' }];
      User.getAllWithPagination.mockResolvedValue(mockUsers);

      await adminController.getAllUsers(req, res);

      expect(User.getAllWithPagination).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      User.updateRole.mockResolvedValue({ affectedRows: 1 });

      req.params.userId = '1';
      req.body.role = 'guru';

      await adminController.updateUserRole(req, res);

      expect(User.updateRole).toHaveBeenCalledWith(1, 'guru');
      expect(res.json).toHaveBeenCalledWith({
        message: 'User role updated successfully'
      });
    });

    it('should handle user not found', async () => {
      User.updateRole.mockResolvedValue({ affectedRows: 0 });

      req.params.userId = '999';
      req.body.role = 'guru';

      await adminController.updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      User.delete.mockResolvedValue({ affectedRows: 1 });

      req.params.userId = '1';

      await adminController.deleteUser(req, res);

      expect(User.delete).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully'
      });
    });

    it('should handle user not found', async () => {
      User.delete.mockResolvedValue({ affectedRows: 0 });

      req.params.userId = '999';

      await adminController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('getSystemReports', () => {
    it('should return system reports', async () => {
      const mockRecentUsers = [
        { id: 1, username: 'user1', created_at: new Date() }
      ];

      User.getRecentUsers.mockResolvedValue(mockRecentUsers);

      await adminController.getSystemReports(req, res);

      expect(User.getRecentUsers).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({
        recentUsers: mockRecentUsers,
        generatedAt: expect.any(Date)
      });
    });
  });
});
