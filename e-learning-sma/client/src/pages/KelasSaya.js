import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classesAPI } from '../services/api';
import '../styles/dashboard.css';

const KelasSaya = () => {
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getStudentRegistrations();
      setMyClasses(response.data);
    } catch (error) {
      setError('Gagal memuat kelas');
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterClass = (classId) => {
    // Navigate to specific class detail page
    navigate(`/kelas/${classId}`);
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
        <h1>Kelas Saya</h1>
        <p>Daftar kelas yang Anda ikuti</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        {myClasses.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada kelas</h3>
            <p>Anda belum bergabung dengan kelas apapun.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {myClasses.map((classItem) => (
              <div key={classItem.id} className="card">
                <div className="card-header">
                  <h3>{classItem.nama_kelas}</h3>
                  <span className={`status-badge ${classItem.status}`}>
                    {classItem.status === 'approved' ? 'Disetujui' : 'Menunggu'}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Kode:</strong> {classItem.kode_kelas}</p>
                  <p><strong>Guru:</strong> {classItem.guru_nama}</p>
                  {classItem.deskripsi && (
                    <p><strong>Deskripsi:</strong> {classItem.deskripsi}</p>
                  )}
                  <p><strong>Status:</strong> 
                    <span className={`status-text ${classItem.status}`}>
                      {classItem.status === 'approved' ? ' ✓ Disetujui' : ' ⏳ Menunggu persetujuan'}
                    </span>
                  </p>
                </div>
                <div className="card-footer">
                  {classItem.status === 'approved' && (
                    <button className="btn btn-primary" onClick={() => handleEnterClass(classItem.kelas_id)}>
                      Masuk Kelas
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KelasSaya;
