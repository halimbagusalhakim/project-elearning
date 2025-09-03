import React, { useState, useEffect } from 'react';
import { classesAPI, materialsAPI, assignmentsAPI } from '../services/api';
import '../styles/dashboard.css';

const DashboardGuru = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [createClassData, setCreateClassData] = useState({
    nama_kelas: '',
    kode_kelas: '',
    deskripsi: ''
  });
  const [createClassLoading, setCreateClassLoading] = useState(false);
  const [createClassError, setCreateClassError] = useState('');

  // State untuk manajemen pendaftaran siswa
  const [selectedClass, setSelectedClass] = useState(null);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [classesRes, materialsRes, assignmentsRes] = await Promise.all([
        classesAPI.getTeacherClasses(),
        materialsAPI.getRecent(),
        assignmentsAPI.getUpcoming()
      ]);

      setMyClasses(classesRes.data);
      setRecentMaterials(materialsRes.data);
      setUpcomingAssignments(assignmentsRes.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setCreateClassLoading(true);
    setCreateClassError('');

    try {
      await classesAPI.create(createClassData);
      setShowCreateClassModal(false);
      setCreateClassData({ nama_kelas: '', kode_kelas: '', deskripsi: '' });
      fetchDashboardData(); // Refresh the classes list
    } catch (error) {
      console.error('Error creating class:', error);
      if (error.response?.data?.error) {
        setCreateClassError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setCreateClassError('Class code already exists');
      } else if (error.response?.status === 500) {
        setCreateClassError('Server error. Please try again.');
      } else {
        setCreateClassError('Failed to create class. Please check your connection.');
      }
    } finally {
      setCreateClassLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCreateClassData({
      ...createClassData,
      [e.target.name]: e.target.value
    });
  };

  // Fungsi untuk membuka modal manajemen pendaftaran
  const openRegistrationManagement = async (classItem) => {
    setSelectedClass(classItem);
    setRegistrationLoading(true);
    setRegistrationError('');

    try {
      const [pendingRes, approvedRes] = await Promise.all([
        classesAPI.getPendingRegistrations(classItem.id),
        classesAPI.getApprovedStudents(classItem.id)
      ]);

      setPendingRegistrations(pendingRes.data);
      setApprovedStudents(approvedRes.data);
      setShowRegistrationModal(true);
    } catch (error) {
      console.error('Error fetching registration data:', error);
      setRegistrationError('Gagal memuat data pendaftaran');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // Fungsi untuk menyetujui pendaftaran
  const handleApproveRegistration = async (registrationId) => {
    try {
      await classesAPI.approveRegistration(registrationId);
      // Refresh data setelah approval
      openRegistrationManagement(selectedClass);
    } catch (error) {
      console.error('Error approving registration:', error);
      setRegistrationError('Gagal menyetujui pendaftaran');
    }
  };

  // Fungsi untuk menolak pendaftaran
  const handleRejectRegistration = async (registrationId) => {
    try {
      await classesAPI.rejectRegistration(registrationId);
      // Refresh data setelah rejection
      openRegistrationManagement(selectedClass);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      setRegistrationError('Gagal menolak pendaftaran');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Guru</h1>
        <p>Selamat datang di platform e-learning SMA</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="card">
          <h2>Kelas Saya</h2>
          {myClasses.length === 0 ? (
            <p>Anda belum membuat kelas</p>
          ) : (
            <div>
              {myClasses.map((classItem) => (
                <div key={classItem.id} className="class-card">
                  <h3>{classItem.nama_kelas}</h3>
                  <p>Kode: {classItem.kode_kelas}</p>
                  <p>Siswa: {classItem.jumlah_siswa || 0} siswa</p>
                  {classItem.deskripsi && <p>{classItem.deskripsi}</p>}
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => openRegistrationManagement(classItem)}
                  >
                    Kelola Pendaftaran
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      <div className="card">
        <h2>Materi Terbaru</h2>
        {recentMaterials.length === 0 ? (
          <p>Belum ada materi terbaru</p>
        ) : (
          <div>
            {recentMaterials
              .filter(material => material.created_by === myClasses.find(c => c.id === material.class_id)?.teacher_id)
              .map((material) => (
                <div key={material.id} className="material-card">
                  <h3>{material.judul}</h3>
                  <p>Kelas: {material.nama_kelas}</p>
                  <p>Oleh: {material.created_by_name}</p>
                  {material.deskripsi && <p>{material.deskripsi}</p>}
                </div>
              ))}
          </div>
        )}
      </div>

        <div className="card">
          <h2>Tugas Mendatang</h2>
          {upcomingAssignments.length === 0 ? (
            <p>Tidak ada tugas mendatang</p>
          ) : (
            <div>
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <h3>{assignment.judul}</h3>
                  <p>Kelas: {assignment.nama_kelas}</p>
                  <p>Oleh: {assignment.created_by_name}</p>
                  {assignment.deadline && (
                    <p className="deadline">
                      Deadline: {new Date(assignment.deadline).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Removed Quick Actions card as per user request */}
      {/* <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateClassModal(true)}
          >
            Buat Kelas Baru
          </button>
          <button className="btn btn-primary">Upload Materi</button>
          <button className="btn btn-primary">Buat Tugas</button>
        </div>
      </div> */}

      {/* Create Class Modal */}
      {showCreateClassModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Buat Kelas Baru</h2>
            {createClassError && <div className="error">{createClassError}</div>}
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label htmlFor="nama_kelas">Nama Kelas:</label>
                <input
                  type="text"
                  id="nama_kelas"
                  name="nama_kelas"
                  value={createClassData.nama_kelas}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="kode_kelas">Kode Kelas:</label>
                <input
                  type="text"
                  id="kode_kelas"
                  name="kode_kelas"
                  value={createClassData.kode_kelas}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi:</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={createClassData.deskripsi}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateClassModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createClassLoading}
                >
                  {createClassLoading ? 'Membuat...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Management Modal */}
      {showRegistrationModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px' }}>
            <h2>Kelola Pendaftaran - {selectedClass?.nama_kelas}</h2>
            {registrationError && <div className="error">{registrationError}</div>}
            
            {registrationLoading ? (
              <div className="loading">Memuat data pendaftaran...</div>
            ) : (
              <div>
                <h3>Pendaftaran Menunggu Persetujuan</h3>
                {pendingRegistrations.length === 0 ? (
                  <p>Tidak ada pendaftaran yang menunggu persetujuan</p>
                ) : (
                  <div className="registration-list">
                    {pendingRegistrations.map((registration) => (
                      <div key={registration.id} className="registration-item">
                        <div>
                          <strong>{registration.nama_lengkap}</strong>
                          <p>Username: {registration.username}</p>
                          <p>Kelas: {registration.kelas_siswa}</p>
                          <small>Didaftarkan pada: {new Date(registration.created_at).toLocaleString('id-ID')}</small>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApproveRegistration(registration.id)}
                          >
                            Setujui
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectRegistration(registration.id)}
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <h3>Siswa yang Telah Disetujui</h3>
                {approvedStudents.length === 0 ? (
                  <p>Belum ada siswa yang disetujui</p>
                ) : (
                  <div className="student-list">
                    {approvedStudents.map((student) => (
                      <div key={student.id} className="student-item">
                        <div>
                          <strong>{student.nama_lengkap}</strong>
                          <p>Username: {student.username}</p>
                          <p>Kelas: {student.kelas_siswa}</p>
                          <small>Disetujui pada: {new Date(student.updated_at).toLocaleString('id-ID')}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowRegistrationModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Styles */}
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .modal {
            background: white;
            padding: 30px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
          }

          .registration-list, .student-list {
            margin: 15px 0;
          }

          .registration-item, .student-item {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .registration-item:hover, .student-item:hover {
            background-color: #f8f9fa;
          }

          .btn-sm {
            padding: 5px 10px;
            font-size: 12px;
          }

          .btn-success {
            background-color: #28a745;
            border-color: #28a745;
          }

          .btn-danger {
            background-color: #dc3545;
            border-color: #dc3545;
          }

          .btn-success:hover {
            background-color: #218838;
            border-color: #1e7e34;
          }

          .btn-danger:hover {
            background-color: #c82333;
            border-color: #bd2130;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardGuru;
