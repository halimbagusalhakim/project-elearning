const assignmentController = require('../controllers/assignmentController');
const Assignment = require('../models/Assignment');

jest.mock('../models/Assignment');

describe('Assignment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 1, role: 'siswa' },
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAssignmentsByClass', () => {
    it('should return assignments successfully', async () => {
      const mockAssignments = [{ id: 1 }, { id: 2 }];
      Assignment.getByClassId.mockResolvedValue(mockAssignments);
      req.params.classId = '1';

      await assignmentController.getAssignmentsByClass(req, res);

      expect(Assignment.getByClassId).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should handle server error', async () => {
      Assignment.getByClassId.mockRejectedValue(new Error('DB error'));
      req.params.classId = '1';

      await assignmentController.getAssignmentsByClass(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getAssignmentsByTeacher', () => {
    it('should return assignments successfully', async () => {
      const mockAssignments = [{ id: 1 }];
      Assignment.getByTeacherId.mockResolvedValue(mockAssignments);

      await assignmentController.getAssignmentsByTeacher(req, res);

      expect(Assignment.getByTeacherId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should handle server error', async () => {
      Assignment.getByTeacherId.mockRejectedValue(new Error('DB error'));

      await assignmentController.getAssignmentsByTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getAssignmentById', () => {
    it('should return assignment successfully', async () => {
      const mockAssignment = { id: 1 };
      Assignment.findById.mockResolvedValue(mockAssignment);
      req.params.id = '1';

      await assignmentController.getAssignmentById(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });

    it('should return 404 if assignment not found', async () => {
      Assignment.findById.mockResolvedValue(null);
      req.params.id = '1';

      await assignmentController.getAssignmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
    });

    it('should handle server error', async () => {
      Assignment.findById.mockRejectedValue(new Error('DB error'));
      req.params.id = '1';

      await assignmentController.getAssignmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('createAssignment', () => {
    it('should create assignment successfully without file', async () => {
      Assignment.create.mockResolvedValue(1);
      req.body = { kelas_id: 1, judul: 'Test', deskripsi: 'Desc', deadline: '2023-01-01' };
      req.user.id = 1;

      await assignmentController.createAssignment(req, res);

      expect(Assignment.create).toHaveBeenCalledWith(expect.objectContaining({
        kelas_id: 1,
        judul: 'Test',
        deskripsi: 'Desc',
        file_path: null,
        file_type: null,
        deadline: '2023-01-01',
        created_by: 1
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, message: 'Assignment created successfully' });
    });

    it('should create assignment successfully with file', async () => {
      Assignment.create.mockResolvedValue(1);
      req.body = { kelas_id: 1, judul: 'Test', deskripsi: 'Desc', deadline: '2023-01-01' };
      req.user.id = 1;
      req.file = { filename: 'file.pdf', mimetype: 'application/pdf' };

      await assignmentController.createAssignment(req, res);

      expect(Assignment.create).toHaveBeenCalledWith(expect.objectContaining({
        file_path: '/uploads/file.pdf',
        file_type: 'application/pdf'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, message: 'Assignment created successfully' });
    });

    it('should handle server error', async () => {
      Assignment.create.mockRejectedValue(new Error('DB error'));
      req.body = { kelas_id: 1, judul: 'Test', deskripsi: 'Desc', deadline: '2023-01-01' };
      req.user.id = 1;

      await assignmentController.createAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('updateAssignment', () => {
    it('should update assignment successfully with new file', async () => {
      const existingAssignment = { id: 1, created_by: 1, file_path: 'oldpath', file_type: 'oldtype' };
      Assignment.findById.mockResolvedValue(existingAssignment);
      Assignment.update.mockResolvedValue(1);
      req.params.id = '1';
      req.user.id = 1;
      req.user.role = 'siswa';
      req.body = { judul: 'New Title', deskripsi: 'New Desc', deadline: '2023-01-02' };
      req.file = { filename: 'newfile.pdf', mimetype: 'application/pdf' };

      await assignmentController.updateAssignment(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith('1');
      expect(Assignment.update).toHaveBeenCalledWith('1', expect.objectContaining({
        judul: 'New Title',
        deskripsi: 'New Desc',
        file_path: '/uploads/newfile.pdf',
        file_type: 'application/pdf',
        deadline: '2023-01-02'
      }));
      expect(res.json).toHaveBeenCalledWith({ message: 'Assignment updated successfully', affectedRows: 1 });
    });

    it('should update assignment successfully without new file', async () => {
      const existingAssignment = { id: 1, created_by: 1, file_path: 'oldpath', file_type: 'oldtype', judul: 'Old', deskripsi: 'Old Desc', deadline: '2023-01-01' };
      Assignment.findById.mockResolvedValue(existingAssignment);
      Assignment.update.mockResolvedValue(1);
      req.params.id = '1';
      req.user.id = 1;
      req.user.role = 'siswa';
      req.body = { judul: undefined, deskripsi: undefined, deadline: undefined };
      req.file = null;

      await assignmentController.updateAssignment(req, res);

      expect(Assignment.update).toHaveBeenCalledWith('1', expect.objectContaining({
        judul: 'Old',
        deskripsi: 'Old Desc',
        file_path: 'oldpath',
        file_type: 'oldtype',
        deadline: '2023-01-01'
      }));
      expect(res.json).toHaveBeenCalledWith({ message: 'Assignment updated successfully', affectedRows: 1 });
    });

    it('should return 404 if assignment not found', async () => {
      Assignment.findById.mockResolvedValue(null);
      req.params.id = '1';

      await assignmentController.updateAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
    });

    it('should return 403 if not authorized', async () => {
      const existingAssignment = { id: 1, created_by: 2 };
      Assignment.findById.mockResolvedValue(existingAssignment);
      req.params.id = '1';
      req.user.id = 1;
      req.user.role = 'siswa';

      await assignmentController.updateAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to update this assignment' });
    });

    it('should handle server error', async () => {
      Assignment.findById.mockRejectedValue(new Error('DB error'));
      req.params.id = '1';

      await assignmentController.updateAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment successfully', async () => {
      const existingAssignment = { id: 1, created_by: 1 };
      Assignment.findById.mockResolvedValue(existingAssignment);
      Assignment.delete.mockResolvedValue(1);
      req.params.id = '1';
      req.user.id = 1;
      req.user.role = 'siswa';

      await assignmentController.deleteAssignment(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith('1');
      expect(Assignment.delete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Assignment deleted successfully', affectedRows: 1 });
    });

    it('should return 404 if assignment not found', async () => {
      Assignment.findById.mockResolvedValue(null);
      req.params.id = '1';

      await assignmentController.deleteAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
    });

    it('should return 403 if not authorized', async () => {
      const existingAssignment = { id: 1, created_by: 2 };
      Assignment.findById.mockResolvedValue(existingAssignment);
      req.params.id = '1';
      req.user.id = 1;
      req.user.role = 'siswa';

      await assignmentController.deleteAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to delete this assignment' });
    });

    it('should handle server error', async () => {
      Assignment.findById.mockRejectedValue(new Error('DB error'));
      req.params.id = '1';

      await assignmentController.deleteAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getUpcomingAssignments', () => {
    it('should return upcoming assignments', async () => {
      const mockAssignments = [{ id: 1 }];
      Assignment.getUpcomingAssignments.mockResolvedValue(mockAssignments);

      await assignmentController.getUpcomingAssignments(req, res);

      expect(Assignment.getUpcomingAssignments).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should handle server error', async () => {
      Assignment.getUpcomingAssignments.mockRejectedValue(new Error('DB error'));

      await assignmentController.getUpcomingAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error: DB error' });
    });
  });

  describe('getOverdueAssignments', () => {
    it('should return overdue assignments', async () => {
      const mockAssignments = [{ id: 1 }];
      Assignment.getOverdueAssignments.mockResolvedValue(mockAssignments);

      await assignmentController.getOverdueAssignments(req, res);

      expect(Assignment.getOverdueAssignments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should handle server error', async () => {
      Assignment.getOverdueAssignments.mockRejectedValue(new Error('DB error'));

      await assignmentController.getOverdueAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getStudentAssignments', () => {
    it('should return student assignments', async () => {
      const mockAssignments = [{ id: 1 }];
      Assignment.getByStudentId.mockResolvedValue(mockAssignments);

      await assignmentController.getStudentAssignments(req, res);

      expect(Assignment.getByStudentId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should return empty array if no assignments', async () => {
      Assignment.getByStudentId.mockResolvedValue([]);
      await assignmentController.getStudentAssignments(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle server error', async () => {
      Assignment.getByStudentId.mockRejectedValue(new Error('DB error'));

      await assignmentController.getStudentAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Server error' }));
    });
  });

  describe('getStudentClassGrades', () => {
    it('should return student class grades', async () => {
      const mockGrades = { assignments: [{ id: 1 }] };
      Assignment.getStudentClassStats.mockResolvedValue(mockGrades);
      req.user.id = 1;
      req.params.classId = '1';

      await assignmentController.getStudentClassGrades(req, res);

      expect(Assignment.getStudentClassStats).toHaveBeenCalledWith(1, '1');
      expect(res.json).toHaveBeenCalledWith(mockGrades.assignments);
    });

    it('should handle server error', async () => {
      Assignment.getStudentClassStats.mockRejectedValue(new Error('DB error'));
      req.user.id = 1;
      req.params.classId = '1';

      await assignmentController.getStudentClassGrades(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Server error' }));
    });
  });

  describe('getAllAssignments', () => {
    it('should return all assignments for admin', async () => {
      const mockAssignments = [{ id: 1 }];
      Assignment.getAll.mockResolvedValue(mockAssignments);
      req.user.role = 'admin';

      await assignmentController.getAllAssignments(req, res);

      expect(Assignment.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it('should return 403 if not admin', async () => {
      req.user.role = 'siswa';

      await assignmentController.getAllAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
    });

    it('should handle server error', async () => {
      Assignment.getAll.mockRejectedValue(new Error('DB error'));
      req.user.role = 'admin';

      await assignmentController.getAllAssignments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Server error' }));
    });
  });
});
