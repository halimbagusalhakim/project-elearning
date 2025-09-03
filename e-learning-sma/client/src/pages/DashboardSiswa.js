import React, { useState, useEffect } from 'react';
import { classesAPI, materialsAPI, assignmentsAPI } from '../services/api';
import '../styles/dashboard.css';

const DashboardSiswa = () => {
  const [classes, setClasses] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [kodeKelas, setKodeKelas] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchMyRegistrations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [classesRes, materialsRes, assignmentsRes] = await Promise.all([
        classesAPI.getAll(),
        materialsAPI.getRecent(),
        assignmentsAPI.getUpcoming()
      ]);

      console.log('Classes API response:', classesRes.data);
      setClasses(classesRes.data);
      setRecentMaterials(materialsRes.data);
      setUpcomingAssignments(assignmentsRes.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyRegistrations = async () => {
    try {
      const response = await classesAPI.getStudentRegistrations();
      console.log('Student registrations API response:', response.data);
      setMyRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  // Fungsi untuk mendapatkan data pendaftaran siswa
  // Removed duplicate declaration of fetchMyRegistrations

  // Fungsi untuk mendaftar ke kelas
  const handleRegisterForClass = async (e) => {
    e.preventDefault();
    setRegistrationLoading(true);
    setRegistrationError('');

    try {
      await classesAPI.registerForClass(kodeKelas);
      setShowRegistrationModal(false);
      setKodeKelas('');
      fetchMyRegistrations(); // Refresh data pendaftaran
    } catch (error) {
      console.error('Error registering for class:', error);
      if (error.response?.data?.error) {
        setRegistrationError(error.response.data.error);
      } else if (error.response?.status === 404) {
        setRegistrationError('Kode kelas tidak ditemukan');
      } else if (error.response?.status === 400) {
        setRegistrationError('Anda sudah terdaftar di kelas ini');
      } else {
        setRegistrationError('Gagal mendaftar ke kelas');
      }
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Siswa</h1>
        <p>Selamat datang di platform e-learning SMA</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="card">
          <h2>Kelas Tersedia</h2>
          {classes.length === 0 ? (
            <p>Belum ada kelas yang tersedia</p>
          ) : (
            <div>
              {classes
                .filter(classItem => !myRegistrations.some(reg => reg.class_id === classItem.id && reg.status === 'approved'))
                .slice(0, 5)
                .map((classItem) => (
                  <div key={classItem.id} className="class-card">
                    <h3>{classItem.nama_kelas}</h3>
                    <p>Kode: {classItem.kode_kelas}</p>
                    <p>Guru: {classItem.guru_nama}</p>
                    {classItem.deskripsi && <p>{classItem.deskripsi}</p>}
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setKodeKelas(classItem.kode_kelas);
                        setShowRegistrationModal(true);
                      }}
                    >
                      Daftar
                    </button>
                  </div>
                ))}
              {classes.length > 5 && (
                <p>+ {classes.length - 5} kelas lainnya</p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Materi Terbaru</h2>
          {recentMaterials.length === 0 ? (
            <p>Belum ada materi terbaru</p>
          ) : (
            <div>
              {recentMaterials.map((material) => (
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

      {/* Quick Actions */}
      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegistrationModal(true)}
          >
            Daftar ke Kelas
          </button>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Daftar ke Kelas</h2>
            {registrationError && <div className="error">{registrationError}</div>}
            <form onSubmit={handleRegisterForClass}>
              <div className="form-group">
                <label htmlFor="kodeKelas">Kode Kelas:</label>
                <input
                  type="text"
                  id="kodeKelas"
                  value={kodeKelas}
                  onChange={(e) => setKodeKelas(e.target.value)}
                  placeholder="Masukkan kode kelas"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setKodeKelas('');
                    setRegistrationError('');
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={registrationLoading}
                >
                  {registrationLoading ? 'Mendaftar...' : 'Daftar'}
                </button>
              </div>
            </form>
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

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }

          .btn-sm {
            padding: 5px 10px;
            font-size: 12px;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardSiswa;
