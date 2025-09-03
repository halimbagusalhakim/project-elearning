import React, { useState, useEffect } from 'react';
import { assignmentsAPI, classesAPI } from '../services/api';
import '../styles/dashboard.css';
import LihatPengumpulan from './LihatPengumpulan';

const ManajemenTugas = () => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classAssignments, setClassAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    kelas_id: '',
    judul: '',
    deskripsi: '',
    deadline: '',
    file: null,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    judul: '',
    deskripsi: '',
    deadline: '',
    file: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // New state for submissions modal
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    if (selectedClass) {
      setCreateData((prev) => ({ ...prev, kelas_id: selectedClass.id }));
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getTeacherClasses();
      setTeacherClasses(response.data);
    } catch (err) {
      setError('Gagal memuat kelas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAssignments = async (classId) => {
    try {
      setAssignmentsLoading(true);
      const response = await assignmentsAPI.getByClass(classId);
      setClassAssignments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleClassClick = async (classItem) => {
    setSelectedClass(classItem);
    await fetchClassAssignments(classItem.id);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassAssignments([]);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const formData = new FormData();
      formData.append('kelas_id', createData.kelas_id);
      formData.append('judul', createData.judul);
      formData.append('deskripsi', createData.deskripsi);
      formData.append('deadline', createData.deadline);
      if (createData.file) {
        formData.append('file', createData.file);
      }

      await assignmentsAPI.create(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowCreateModal(false);
      setCreateData({ kelas_id: '', judul: '', deskripsi: '', deadline: '', file: null });
      if (selectedClass) {
        await fetchClassAssignments(selectedClass.id);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setCreateError('Gagal membuat tugas');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setCreateData({ ...createData, file: files[0] });
    } else {
      setCreateData({ ...createData, [name]: value });
    }
  };

  // Edit handlers
  const openEditModal = (assignment) => {
    setEditData({
      id: assignment.id,
      judul: assignment.judul,
      deskripsi: assignment.deskripsi,
      deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
      file: null,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setEditData({ ...editData, file: files[0] });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('judul', editData.judul);
      formData.append('deskripsi', editData.deskripsi);
      formData.append('deadline', editData.deadline);
      if (editData.file) {
        formData.append('file', editData.file);
      }

      await assignmentsAPI.update(editData.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowEditModal(false);
      setEditData({ id: '', judul: '', deskripsi: '', deadline: '', file: null });
      if (selectedClass) {
        await fetchClassAssignments(selectedClass.id);
      }
    } catch (err) {
      console.error('Error updating assignment:', err);
      setEditError('Gagal memperbarui tugas');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      return;
    }
    try {
      await assignmentsAPI.delete(id);
      setDeleteError('');
      if (selectedClass) {
        await fetchClassAssignments(selectedClass.id);
      }
    } catch (err) {
      console.error('Gagal menghapus tugas:', err);
      setDeleteError('Gagal menghapus tugas');
    }
  };

  // New handler for viewing submissions
  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
  };

  const closeSubmissionsModal = () => {
    setShowSubmissionsModal(false);
    setSelectedAssignment(null);
  };

  const getSubmissionStats = (assignment) => {
    const totalStudents = assignment.jumlah_siswa || 0;
    const submitted = assignment.jumlah_submission || 0;
    const percentage = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;

    return { totalStudents, submitted, percentage };
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat kelas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Manajemen Tugas</h1>
        <p>Kelola tugas pembelajaran</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {deleteError && <div className="error-message">{deleteError}</div>}

      <div className="content-grid">
        {!selectedClass ? (
          teacherClasses.length === 0 ? (
            <div className="empty-state">
              <h3>Belum ada kelas</h3>
              <p>Anda belum membuat kelas apapun.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {teacherClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="card clickable"
                  onClick={() => handleClassClick(classItem)}
                >
                  <div className="card-header">
                    <h3>{classItem.nama_kelas}</h3>
                    <span className="class-code">{classItem.kode_kelas}</span>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Kode Kelas:</strong> {classItem.kode_kelas}
                    </p>
                    <p>
                      <strong>Jumlah Siswa:</strong> {classItem.jumlah_siswa || 0} siswa
                    </p>
                    {classItem.deskripsi && (
                      <p>
                        <strong>Deskripsi:</strong> {classItem.deskripsi}
                      </p>
                    )}
                    <p>
                      <strong>Dibuat:</strong>{' '}
                      {new Date(classItem.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary">Lihat Tugas</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="back-button-container">
              <button className="btn btn-secondary" onClick={handleBackToClasses}>
                ← Kembali ke Daftar Kelas
              </button>
              <h2>Tugas untuk {selectedClass.nama_kelas}</h2>
            </div>

            <div className="action-bar">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                + Tambah Tugas Baru
              </button>
            </div>

            {assignmentsLoading ? (
              <div className="loading">Memuat tugas...</div>
            ) : classAssignments.length === 0 ? (
              <div className="empty-state">
                <h3>Belum ada tugas</h3>
                <p>Belum ada tugas untuk kelas ini.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {classAssignments.map((assignment) => {
                  const stats = getSubmissionStats(assignment);
                  const isOverdue = new Date() > new Date(assignment.deadline);

                  return (
                    <div key={assignment.id} className="card">
                      <div className="card-header">
                        <h3>{assignment.judul}</h3>
                        <span className={`status-badge ${isOverdue ? 'overdue' : 'active'}`}>
                          {isOverdue ? 'Selesai' : 'Aktif'}
                        </span>
                      </div>
                      <div className="card-body">
                        <p>
                          <strong>Deadline:</strong>{' '}
                          {new Date(assignment.deadline).toLocaleString('id-ID')}
                        </p>
                        <p>
                          <strong>Deskripsi:</strong> {assignment.deskripsi}
                        </p>
                        <div className="progress-section">
                          <p><strong>Pengumpulan:</strong> {stats.submitted}/{stats.totalStudents} siswa ({stats.percentage}%)</p>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${stats.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        {assignment.file_path && (
                          <a
                            href={`http://localhost:5000${assignment.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                          >
                            Lihat Soal
                          </a>
                        )}
                        <button className="btn btn-primary" onClick={() => handleViewSubmissions(assignment)}>
                          Lihat Pengumpulan
                        </button>
                        <button className="btn btn-primary" onClick={() => openEditModal(assignment)}>
                          Edit Tugas
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDeleteAssignment(assignment.id)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Tambah Tugas Baru</h2>
            {createError && <div className="error-message">{createError}</div>}
            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                {/* Removed Pilih Kelas dropdown as kelas_id is set automatically */}
              </div>
              <div className="form-group">
                <label htmlFor="judul">Judul Tugas:</label>
                <input
                  type="text"
                  id="judul"
                  name="judul"
                  value={createData.judul}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi:</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={createData.deskripsi}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline:</label>
                <input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  value={createData.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Upload File:</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Tugas</h2>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleUpdateAssignment}>
              <div className="form-group">
                <label htmlFor="judul">Judul Tugas:</label>
                <input
                  type="text"
                  id="edit-judul"
                  name="judul"
                  value={editData.judul}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi:</label>
                <textarea
                  id="edit-deskripsi"
                  name="deskripsi"
                  value={editData.deskripsi}
                  onChange={handleEditInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline:</label>
                <input
                  type="datetime-local"
                  id="edit-deadline"
                  name="deadline"
                  value={editData.deadline}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Upload File (opsional):</label>
                <input
                  type="file"
                  id="edit-file"
                  name="file"
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionsModal && selectedAssignment && (
        <LihatPengumpulan
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.judul}
          onClose={closeSubmissionsModal}
        />
      )}
    </div>
  );
};

export default ManajemenTugas;
