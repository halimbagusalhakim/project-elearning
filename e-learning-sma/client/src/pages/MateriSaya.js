import React, { useState, useEffect } from 'react';
import { materialsAPI } from '../services/api';
import '../styles/dashboard.css';

const MateriSaya = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyMaterials();
  }, []);

  const fetchMyMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialsAPI.getStudentMaterials();
      setMaterials(response.data);
      setError(''); // Clear error on successful load
    } catch (error) {
      setError('Gagal memuat materi');
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = filter === 'all' 
    ? materials 
    : materials.filter(material => material.kelas_id === parseInt(filter));

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat materi...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Materi Saya</h1>
        <p>Daftar materi pembelajaran untuk kelas yang Anda ikuti</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        {materials.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada materi</h3>
            <p>Belum ada materi yang tersedia untuk kelas Anda.</p>
          </div>
        ) : (
          <>
            <div className="filter-section">
              <label htmlFor="classFilter">Filter berdasarkan kelas:</label>
              <select 
                id="classFilter" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Kelas</option>
                {Array.from(new Set(materials.map(m => m.kelas_id))).filter(classId => classId != null).map(classId => {
                  const classItem = materials.find(m => m.kelas_id === classId);
                  return classItem ? (
                    <option key={classId} value={String(classId)}>
                      {classItem.nama_kelas}
                    </option>
                  ) : null;
                })}
              </select>
            </div>

            <div className="cards-grid">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="card">
                  <div className="card-header">
                    <h3>{material.judul}</h3>
                    <span className="material-type">{material.file_type || 'Teks'}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Kelas:</strong> {material.nama_kelas}</p>
                    <p><strong>Dibuat oleh:</strong> {material.created_by_name}</p>
                    {material.deskripsi && (
                      <p><strong>Deskripsi:</strong> {material.deskripsi}</p>
                    )}
                    <p><strong>Tanggal:</strong> {new Date(material.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="card-footer">
                    {material.file_path ? (
                      <a 
                        href={`http://localhost:5000${material.file_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Download Materi
                      </a>
                    ) : (
                      <span className="no-file">Tidak ada file</span>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MateriSaya;
