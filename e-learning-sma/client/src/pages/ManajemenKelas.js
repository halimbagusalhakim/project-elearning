import React, { useState, useEffect } from 'react';
import { classesAPI, adminAPI } from '../services/api';
import '../styles/dashboard.css';

const ManajemenKelas = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageStudentsModal, setShowManageStudentsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [createData, setCreateData] = useState({
    nama_kelas: '',
    kode_kelas: '',
    deskripsi: '',
    guru_id: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [editData, setEditData] = useState({
    nama_kelas: '',
    kode_kelas: '',
    deskripsi: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
    fetchClasses();
    if (user.role === 'admin') {
      fetchTeachers();
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let response;

      if (user.role === 'admin') {
        // Admin can see all classes
        response = await classesAPI.getAll();
      } else {
        // Guru can only see their own classes
        response = await classesAPI.getTeacherClasses();
      }

      setMyClasses(response.data);
    } catch (error) {
      setError('Gagal memuat kelas');
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRegistrations = async (classId) => {
    try {
      setStudentsLoading(true);
      setStudentsError('');
      const response = await classesAPI.getPendingRegistrations(classId);
      setPendingRegistrations(response.data);
    } catch (error) {
      setStudentsError('Gagal memuat pendaftaran siswa');
      console.error('Error fetching pending registrations:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchApprovedStudents = async (classId) => {
    try {
      const response = await classesAPI.getApprovedStudents(classId);
      setApprovedStudents(response.data);
    } catch (error) {
      console.error('Error fetching approved students:', error);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      await classesAPI.create(createData);
      setShowCreateModal(false);
      setCreateData({ nama_kelas: '', kode_kelas: '', deskripsi: '', guru_id: '' });
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      if (error.response?.data?.error) {
        setCreateError(error.response.data.error);
      } else {
        setCreateError('Gagal membuat kelas');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      await classesAPI.update(selectedClass.id, editData);
      setShowEditModal(false);
      setSelectedClass(null);
      setEditData({ nama_kelas: '', kode_kelas: '', deskripsi: '' });
      fetchClasses();
    } catch (error) {
      console.error('Error updating class:', error);
      if (error.response?.data?.error) {
        setEditError(error.response.data.error);
      } else {
        setEditError('Gagal mengupdate kelas');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    setDeleteLoading(true);

    try {
      await classesAPI.delete(selectedClass.id);
    setShowDeleteConfirm(false);
    setSelectedClass(null);
    fetchClasses();
  } catch (error) {
    console.error('Error deleting class:', error);
    alert('Gagal menghapus kelas');
  } finally {
    setDeleteLoading(false);
  }
};

  const handleApproveRegistration = async (registrationId) => {
    try {
      await classesAPI.approveRegistration(registrationId);
      // Refresh data
      await fetchPendingRegistrations(selectedClass.id);
      await fetchApprovedStudents(selectedClass.id);
      fetchClasses(); // Refresh class list to update student count
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Gagal menyetujui pendaftaran');
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      await classesAPI.rejectRegistration(registrationId);
      await fetchPendingRegistrations(selectedClass.id);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Gagal menolak pendaftaran');
    }
  };

  const handleRemoveStudent = async (registrationId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus siswa ini dari kelas?')) {
      return;
    }

    try {
      await classesAPI.removeStudent(registrationId);
      // Refresh data
      await fetchApprovedStudents(selectedClass.id);
      fetchClasses(); // Refresh class list to update student count
      alert('Siswa berhasil dihapus dari kelas');
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Gagal menghapus siswa dari kelas');
    }
  };

  const handleManageStudents = async (classItem) => {
    setSelectedClass(classItem);
    setShowManageStudentsModal(true);
    await fetchPendingRegistrations(classItem.id);
    await fetchApprovedStudents(classItem.id);
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setEditData({
      nama_kelas: classItem.nama_kelas,
      kode_kelas: classItem.kode_kelas,
      deskripsi: classItem.deskripsi || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (classItem) => {
    setSelectedClass(classItem);
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (e) => {
    setCreateData({
      ...createData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
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
        <h1>Manajemen Kelas</h1>
        <p>Kelola kelas yang Anda buat</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="action-bar">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Buat Kelas Baru
        </button>
      </div>

      <div className="content-grid">
        {myClasses.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada kelas</h3>
            <p>Anda belum membuat kelas apapun.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {myClasses.map((classItem) => (
              <div key={classItem.id} className="card">
                <div className="card-header">
                  <h3>{classItem.nama_kelas}</h3>
                  <span className="class-code">{classItem.kode_kelas}</span>
                </div>
                <div className="card-body">
                  <p><strong>Kode Kelas:</strong> {classItem.kode_kelas}</p>
                  <p><strong>Jumlah Siswa:</strong> {classItem.jumlah_siswa || 0} siswa</p>
                  {classItem.deskripsi && (
                    <p><strong>Deskripsi:</strong> {classItem.deskripsi}</p>
                  )}
                  <p><strong>Dibuat:</strong> {new Date(classItem.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEdit(classItem)}
                  >
                    Edit Kelas
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleManageStudents(classItem)}
                  >
                    Kelola Siswa
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(classItem)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Buat Kelas Baru</h2>
            {createError && <div className="error-message">{createError}</div>}
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label htmlFor="nama_kelas">Nama Kelas:</label>
                <input
                  type="text"
                  id="nama_kelas"
                  name="nama_kelas"
                  value={createData.nama_kelas}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Matematika Kelas X"
                />
              </div>
              <div className="form-group">
                <label htmlFor="kode_kelas">Kode Kelas:</label>
                <input
                  type="text"
                  id="kode_kelas"
                  name="kode_kelas"
                  value={createData.kode_kelas}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: MATH-X-001"
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
                  placeholder="Deskripsi singkat tentang kelas"
                />
              </div>
              {userRole === 'admin' && (
                <div className="form-group">
                  <label htmlFor="guru_id">Guru Pengajar:</label>
                  <select
                    id="guru_id"
                    name="guru_id"
                    value={createData.guru_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Guru</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? 'Membuat...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && selectedClass && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Kelas</h2>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleEditClass}>
              <div className="form-group">
                <label htmlFor="edit_nama_kelas">Nama Kelas:</label>
                <input
                  type="text"
                  id="edit_nama_kelas"
                  name="nama_kelas"
                  value={editData.nama_kelas}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Contoh: Matematika Kelas X"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_kode_kelas">Kode Kelas:</label>
                <input
                  type="text"
                  id="edit_kode_kelas"
                  name="kode_kelas"
                  value={editData.kode_kelas}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Contoh: MATH-X-001"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_deskripsi">Deskripsi:</label>
                <textarea
                  id="edit_deskripsi"
                  name="deskripsi"
                  value={editData.deskripsi}
                  onChange={handleEditInputChange}
                  rows="3"
                  placeholder="Deskripsi singkat tentang kelas"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Mengupdate...' : 'Update Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Students Modal */}
      {showManageStudentsModal && selectedClass && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <h2>Kelola Siswa - {selectedClass.nama_kelas}</h2>
            
            {studentsError && <div className="error-message">{studentsError}</div>}
            
            <div className="students-section">
              <h3>Pendaftaran Menunggu Persetujuan</h3>
              {studentsLoading ? (
                <div className="loading">Memuat pendaftaran...</div>
              ) : pendingRegistrations.length === 0 ? (
                <p>Tidak ada pendaftaran yang menunggu persetujuan.</p>
              ) : (
                <div className="registrations-list">
                  {pendingRegistrations.map((registration) => (
                    <div key={registration.id} className="registration-item">
                      <div className="registration-info">
                        <p><strong>Nama Siswa:</strong> {registration.nama_lengkap}</p>
                        <p><strong>Username:</strong> {registration.username}</p>
                        <p><strong>Kelas:</strong> {registration.kelas_siswa}</p>
                        <p><strong>Tanggal Daftar:</strong> {new Date(registration.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="registration-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApproveRegistration(registration.id)}
                        >
                          Setujui
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRejectRegistration(registration.id)}
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="students-section">
              <h3>Siswa yang Telah Disetujui</h3>
              {approvedStudents.length === 0 ? (
                <p>Belum ada siswa yang disetujui.</p>
              ) : (
                <div className="students-list">
                  {approvedStudents.map((student) => (
                    <div key={student.id} className="student-item">
                      <div className="student-info">
                        <p><strong>Nama:</strong> {student.nama_lengkap}</p>
                        <p><strong>Username:</strong> {student.username}</p>
                        <p><strong>Kelas:</strong> {student.kelas_siswa}</p>
                        <p><strong>Tanggal Bergabung:</strong> {new Date(student.updated_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="student-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRemoveStudent(student.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowManageStudentsModal(false);
                  setSelectedClass(null);
                  setPendingRegistrations([]);
                  setApprovedStudents([]);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedClass && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus kelas "{selectedClass.nama_kelas}"?</p>
            <p>Semua data terkait kelas ini akan dihapus permanen.</p>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedClass(null);
                }}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteClass}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenKelas;
