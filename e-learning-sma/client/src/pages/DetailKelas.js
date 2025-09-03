import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classesAPI, materialsAPI, assignmentsAPI } from '../services/api';
import '../styles/dashboard.css';

const DetailKelas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);

      // Fetch class details
      const classResponse = await classesAPI.getById(id);
      setClassData(classResponse.data);

      // Fetch materials for this class
      const materialsResponse = await materialsAPI.getByClass(id);
      setMaterials(materialsResponse.data);

      // Fetch assignments for this class
      const assignmentsResponse = await assignmentsAPI.getByClass(id);
      setAssignments(assignmentsResponse.data);

      // Fetch submissions for assignments
      const submittedAssignments = assignmentsResponse.data.filter(a => a.submitted);
      const submissionPromises = submittedAssignments.map(async (assignment) => {
        try {
          const subResponse = await submissionsAPI.getByAssignment(assignment.id);
          if (subResponse.data && subResponse.data.length > 0) {
            return { assignmentId: assignment.id, submission: subResponse.data[0] };
          }
        } catch (error) {
          console.error('Error fetching submission for assignment', assignment.id, error);
        }
        return null;
      });

      const submissionsData = await Promise.all(submissionPromises);
      const submissionsMap = {};
      submissionsData.forEach(item => {
        if (item) {
          submissionsMap[item.assignmentId] = item.submission;
        }
      });
      setSubmissions(submissionsMap);

    } catch (error) {
      setError('Gagal memuat detail kelas');
      console.error('Error fetching class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMaterial = (material) => {
    if (material.file_path) {
      window.open(`http://localhost:5000${material.file_path}`, '_blank');
    }
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/tugas/${assignmentId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat detail kelas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/kelas-saya')}>
          Kembali ke Kelas Saya
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/kelas-saya')}
          style={{ marginBottom: '10px' }}
        >
          ← Kembali
        </button>
        <h1>{classData?.nama_kelas}</h1>
        <p>Kode: {classData?.kode_kelas} | Guru: {classData?.guru_nama}</p>
        {classData?.deskripsi && (
          <p style={{ marginTop: '10px', color: '#666' }}>{classData.deskripsi}</p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materi ({materials.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Tugas ({assignments.length})
        </button>
        {/* <button
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Absensi
        </button> */}
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && (
        <div className="content-grid">
          {materials.length === 0 ? (
            <div className="empty-state">
              <h3>Belum ada materi</h3>
              <p>Materi untuk kelas ini belum tersedia.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {materials.map((material) => (
                <div key={material.id} className="card">
                  <div className="card-header">
                    <h3>{material.judul}</h3>
                    <span className="material-type">
                      {material.file_type || 'Dokumen'}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Dibuat:</strong> {new Date(material.created_at).toLocaleDateString('id-ID')}</p>
                    {material.deskripsi && (
                      <p><strong>Deskripsi:</strong> {material.deskripsi}</p>
                    )}
                  </div>
                  <div className="card-footer">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownloadMaterial(material)}
                    >
                      Unduh Materi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="content-grid">
          {assignments.length === 0 ? (
            <div className="empty-state">
              <h3>Belum ada tugas</h3>
              <p>Tugas untuk kelas ini belum tersedia.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {assignments.map((assignment) => {
                const submission = submissions[assignment.id];
                return (
                  <div key={assignment.id} className="card">
                    <div className="card-header">
                      <h3>{assignment.judul}</h3>
                      <span className={`status-badge ${new Date(assignment.deadline) < new Date() ? 'overdue' : 'active'}`}>
                        {new Date(assignment.deadline) < new Date() ? 'Terlambat' : 'Aktif'}
                      </span>
                    </div>
                    <div className="card-body">
                      <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString('id-ID')}</p>
                      <p><strong>Dibuat:</strong> {new Date(assignment.created_at).toLocaleDateString('id-ID')}</p>
                      {assignment.deskripsi && (
                        <p><strong>Deskripsi:</strong> {assignment.deskripsi}</p>
                      )}
                    </div>
                    <div className="card-footer">
                      {submission && submission.file_path ? (
                        <a
                          href={`http://localhost:5000${submission.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info"
                          style={{ marginRight: '10px' }}
                        >
                          Lihat File Tugas
                        </a>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleViewAssignment(assignment.id)}
                        >
                          Lihat Tugas
                        </button>
                      )}
                      {submission && (
                        <div className="grading-status" style={{ marginTop: '10px' }}>
                          <p><strong>Status Penilaian:</strong> {submission.status === 'graded' ? `Dinilai (${submission.nilai})` : 'Belum dinilai'}</p>
                          <p><strong>Submission status:</strong> {submission.status || 'Not submitted'}</p>
                          <p><strong>Last modified:</strong> {submission.updated_at ? new Date(submission.updated_at).toLocaleString('id-ID') : 'N/A'}</p>
                          {submission.komentar && (
                            <p><strong>Submission comments:</strong> {submission.komentar}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/*
      {activeTab === 'attendance' && (
        <div className="content-grid">
          <div className="empty-state">
            <h3>Fitur Absensi</h3>
            <p>Fitur absensi akan segera hadir.</p>
            <button className="btn btn-primary" disabled>
              Tandai Hadir
            </button>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default DetailKelas;
