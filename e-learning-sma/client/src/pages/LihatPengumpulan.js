import React, { useState, useEffect } from 'react';
import { submissionsAPI } from '../services/api';
import '../styles/dashboard.css';

const LihatPengumpulan = ({ assignmentId, assignmentTitle, onClose }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingModal, setGradingModal] = useState(null);
  const [gradeData, setGradeData] = useState({ nilai: '', komentar: '' });
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getByAssignment(assignmentId);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Gagal memuat pengumpulan');
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (submission) => {
    setGradingModal(submission);
    setGradeData({
      nilai: submission.nilai || '',
      komentar: submission.komentar || ''
    });
  };

  const closeGradingModal = () => {
    setGradingModal(null);
    setGradeData({ nilai: '', komentar: '' });
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    setGradingLoading(true);

    try {
      await submissionsAPI.grade(gradingModal.id, {
        nilai: parseFloat(gradeData.nilai),
        komentar: gradeData.komentar
      });

      // Refresh submissions
      await fetchSubmissions();
      closeGradingModal();
    } catch (err) {
      console.error('Error grading submission:', err);
      setError('Gagal memberikan nilai');
    } finally {
      setGradingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="status-badge submitted">Dikumpulkan</span>;
      case 'graded':
        return <span className="status-badge graded">Dinilai</span>;
      case 'late':
        return <span className="status-badge late">Terlambat</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">Memuat pengumpulan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h2>Pengumpulan Tugas: {assignmentTitle}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-body">
          {submissions.length === 0 ? (
            <div className="empty-state">
              <h3>Belum ada pengumpulan</h3>
              <p>Belum ada siswa yang mengumpulkan tugas ini.</p>
            </div>
          ) : (
            <div className="submissions-list">
              {submissions.map((submission) => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-header">
                    <div className="student-info">
                      <h4>{submission.nama_lengkap}</h4>
                      <p>@{submission.username}</p>
                    </div>
                    <div className="submission-status">
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>

                  <div className="submission-body">
                    <div className="submission-meta">
                      <p><strong>Dikumpulkan:</strong> {new Date(submission.submitted_at).toLocaleString('id-ID')}</p>
                      {submission.graded_at && (
                        <p><strong>Dinilai:</strong> {new Date(submission.graded_at).toLocaleString('id-ID')}</p>
                      )}
                    </div>

                    {submission.nilai && (
                      <div className="grade-info">
                        <p><strong>Nilai:</strong> {submission.nilai}/100</p>
                      </div>
                    )}

                    {submission.komentar && (
                      <div className="comment-section">
                        <p><strong>Komentar:</strong></p>
                        <p className="comment-text">{submission.komentar}</p>
                      </div>
                    )}

                    {submission.file_path && (
                      <div className="file-section">
                        <p><strong>File Pengumpulan:</strong></p>
                        <a
                          href={`http://localhost:5000${submission.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          Lihat File
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="submission-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => openGradingModal(submission)}
                    >
                      {submission.nilai ? 'Edit Nilai' : 'Beri Nilai'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {gradingModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Beri Nilai: {gradingModal.nama_lengkap}</h3>
                <button className="close-btn" onClick={closeGradingModal}>×</button>
              </div>

              <form onSubmit={handleGradeSubmission}>
                <div className="form-group">
                  <label htmlFor="nilai">Nilai (0-100):</label>
                  <input
                    type="number"
                    id="nilai"
                    min="0"
                    max="100"
                    value={gradeData.nilai}
                    onChange={(e) => setGradeData({ ...gradeData, nilai: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="komentar">Komentar:</label>
                  <textarea
                    id="komentar"
                    value={gradeData.komentar}
                    onChange={(e) => setGradeData({ ...gradeData, komentar: e.target.value })}
                    rows="4"
                    placeholder="Berikan komentar untuk siswa..."
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeGradingModal}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={gradingLoading}
                  >
                    {gradingLoading ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LihatPengumpulan;
