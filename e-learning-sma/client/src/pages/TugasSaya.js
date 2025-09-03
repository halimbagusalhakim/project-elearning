import React, { useState, useEffect } from 'react';
import { assignmentsAPI, submissionsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const TugasSaya = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      console.log('fetchMyAssignments called - starting to fetch student assignments');
      setLoading(true);

      console.log('Making API call to getStudentAssignments');
      const response = await assignmentsAPI.getStudentAssignments();

      console.log('API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataLength: response.data ? response.data.length : 'undefined'
      });

      if (response && response.data) {
        console.log('Setting assignments state with', response.data.length, 'assignments');
        setAssignments(response.data);
        setError(''); // Clear error on successful load

        // Fetch submissions for submitted assignments
        const submittedAssignments = response.data.filter(a => a.submission_id || a.submitted_at);
        console.log('Found', submittedAssignments.length, 'submitted assignments, fetching submission details');

        const submissionPromises = submittedAssignments.map(async (assignment) => {
          try {
            console.log('Fetching submission for assignment ID:', assignment.id);
            const subResponse = await submissionsAPI.getByAssignment(assignment.id);
            if (subResponse.data && subResponse.data.length > 0) {
              console.log('Submission found for assignment', assignment.id);
              return { assignmentId: assignment.id, submission: subResponse.data[0] };
            } else {
              console.log('No submission data found for assignment', assignment.id);
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

        console.log('Setting submissions state with', Object.keys(submissionsMap).length, 'submissions');
        setSubmissions(submissionsMap);

        // Refresh assignments state to update UI after submission
        // This forces re-render with updated submission info
        setAssignments(prev => [...prev]);
        console.log('Assignments state updated successfully');
      } else {
        console.error('No response data received from API');
        setError('Gagal memuat tugas: data tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      setError('Gagal memuat tugas');
    } finally {
      setLoading(false);
      console.log('fetchMyAssignments completed');
    }
  };

  const handleEdit = (assignmentId) => {
    navigate(`/tugas/${assignmentId}`);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumpulan tugas ini?')) {
      try {
        const submission = submissions[assignmentId];
        if (submission) {
          await submissionsAPI.delete(submission.id);
          // Refresh assignments
          await fetchMyAssignments();
        }
      } catch (error) {
        setError('Gagal menghapus tugas');
        console.error('Error deleting submission:', error);
      }
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const deadline = new Date(assignment.deadline);

    // Check if assignment has been submitted by looking for submission_id or submitted_at
    if (assignment.submission_id || assignment.submitted_at) return 'submitted';
    if (now > deadline) return 'overdue';
    return 'pending';
  };

  // Filter assignments by selected class or show all
  const filteredAssignments = filter === 'all'
    ? assignments
    : assignments.filter(assignment => assignment.kelas_id === parseInt(filter));

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat tugas...</div>
      </div>
    );
  }

  // Calculate submission statistics
  const submittedCount = assignments.filter(a => a.submission_id || a.submitted_at).length;
  const pendingCount = assignments.filter(a => !a.submission_id && !a.submitted_at && new Date(a.deadline) > new Date()).length;
  const overdueCount = assignments.filter(a => !a.submission_id && !a.submitted_at && new Date(a.deadline) <= new Date()).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tugas Saya</h1>
        <p>Daftar tugas yang harus diselesaikan</p>

        {/* Submission Status Summary */}
        {assignments.length > 0 && (
          <div className="status-summary" style={{
            display: 'flex',
            gap: '20px',
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div className="status-item" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{submittedCount}</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>SUDAH DISERAHKAN</div>
            </div>
            <div className="status-item" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{pendingCount}</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>BELUM DISERAHKAN</div>
            </div>
            <div className="status-item" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{overdueCount}</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>TERLAMBAT</div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        {assignments.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada tugas</h3>
            <p>Tidak ada tugas yang harus diselesaikan saat ini.</p>
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
                {Array.from(new Set(assignments.map(a => a.kelas_id))).map(classId => {
                  const classItem = assignments.find(a => a.kelas_id === classId);
                  return (
                    <option key={classId} value={classId}>
                      {classItem.nama_kelas}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="cards-grid">
              {filteredAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                const statusClass = `status-badge ${status}`;
                const statusText = {
                  submitted: '✓ SUDAH DISERAHKAN',
                  overdue: '⏰ TERLAMBAT',
                  pending: '⏳ BELUM DISERAHKAN'
                }[status];

                // Add visual styling based on status
                const cardStyle = status === 'submitted'
                  ? { borderLeft: '4px solid #28a745', backgroundColor: '#f8fff9' }
                  : status === 'overdue'
                  ? { borderLeft: '4px solid #dc3545', backgroundColor: '#fff5f5' }
                  : { borderLeft: '4px solid #ffc107', backgroundColor: '#fffbf0' };

                return (
                  <div key={assignment.id} className="card" style={cardStyle}>
                    <div className="card-header">
                      <h3>{assignment.judul}</h3>
                      <span className={statusClass} style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        color: 'white',
                        backgroundColor: status === 'submitted' ? '#28a745' :
                                       status === 'overdue' ? '#dc3545' : '#ffc107'
                      }}>
                        {statusText}
                      </span>
                    </div>
                    <div className="card-body">
                      <p><strong>Kelas:</strong> {assignment.nama_kelas}</p>
                      <p><strong>Dibuat oleh:</strong> {assignment.created_by_name}</p>
                      {assignment.deskripsi && (
                        <p><strong>Deskripsi:</strong> {assignment.deskripsi}</p>
                      )}
                      {assignment.deadline && (
                        <p className={status === 'overdue' ? 'text-danger' : ''}>
                          <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString('id-ID')}
                        </p>
                      )}
                      {(assignment.submission_id || assignment.submitted_at) && (
                        <div style={{
                          backgroundColor: '#d4edda',
                          border: '1px solid #c3e6cb',
                          borderRadius: '4px',
                          padding: '8px',
                          marginTop: '8px'
                        }}>
                          <p style={{ margin: '0', color: '#155724', fontWeight: 'bold' }}>
                            ✅ <strong>Status Pengumpulan:</strong> SUDAH DISERAHKAN
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#155724' }}>
                            <strong>Waktu Pengumpulan:</strong> {new Date(assignment.submitted_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                      {!(assignment.submission_id || assignment.submitted_at) && status === 'pending' && (
                        <div style={{
                          backgroundColor: '#fff3cd',
                          border: '1px solid #ffeaa7',
                          borderRadius: '4px',
                          padding: '8px',
                          marginTop: '8px'
                        }}>
                          <p style={{ margin: '0', color: '#856404', fontWeight: 'bold' }}>
                            ⚠️ <strong>Status Pengumpulan:</strong> BELUM DISERAHKAN
                          </p>
                        </div>
                      )}
                      {!(assignment.submission_id || assignment.submitted_at) && status === 'overdue' && (
                        <div style={{
                          backgroundColor: '#f8d7da',
                          border: '1px solid #f5c6cb',
                          borderRadius: '4px',
                          padding: '8px',
                          marginTop: '8px'
                        }}>
                          <p style={{ margin: '0', color: '#721c24', fontWeight: 'bold' }}>
                            ❌ <strong>Status Pengumpulan:</strong> TERLAMBAT - BELUM DISERAHKAN
                          </p>
                        </div>
                      )}
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
                      {status !== 'submitted' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/tugas/${assignment.id}`)}
                        >
                          {status === 'overdue' ? 'Serahkan Sekarang' : 'Kerjakan Tugas'}
                        </button>
                      )}
                      {status === 'submitted' && (
                        <div className="submitted-actions">
                          {submissions[assignment.id] && submissions[assignment.id].file_path && (
                            <a
                              href={`http://localhost:5000${submissions[assignment.id].file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-info"
                              style={{ marginRight: '10px' }}
                            >
                              Lihat File Tugas
                            </a>
                          )}
                          <button
                            className="btn btn-warning"
                            onClick={() => handleEdit(assignment.id)}
                            style={{ marginRight: '10px' }}
                          >
                            Edit Tugas
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            Hapus Tugas
                          </button>
                          {submissions[assignment.id] && (
                            <div className="grading-status" style={{ marginTop: '10px' }}>
                              <p><strong>Status Penilaian:</strong> {submissions[assignment.id].status === 'graded' ? `Dinilai (${submissions[assignment.id].nilai})` : 'Belum dinilai'}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TugasSaya;
