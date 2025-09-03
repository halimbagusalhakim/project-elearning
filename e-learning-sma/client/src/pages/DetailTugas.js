import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsAPI, submissionsAPI } from '../services/api';
import '../styles/dashboard.css';

const DetailTugas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  const [submission, setSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    fetchAssignment();
    fetchSubmission();
  }, [id]);

  useEffect(() => {
    // Debug log to check submission state changes
    console.log('Submission state updated:', submission);
  }, [submission]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getById(id);
      setAssignment(response.data);
    } catch (error) {
      setError('Gagal memuat detail tugas');
      console.error('Error fetching assignment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      setSubmissionLoading(true);
      const response = await submissionsAPI.getByAssignment(id);
      if (response.data && response.data.length > 0) {
        setSubmission(response.data[0]);
      } else {
        setSubmission(null);
      }
    } catch (error) {
      setSubmissionError('Gagal memuat data pengumpulan tugas');
      console.error('Error fetching submission:', error);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Silakan pilih file untuk diunggah.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignment_id', id);

      await submissionsAPI.create(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess('Tugas berhasil dikumpulkan.');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchSubmission(); // Refresh submission data after upload
      // After successful submission, navigate back to previous page or update UI accordingly
      setTimeout(() => {
        navigate(-1); // Navigate back to previous page after 1 second delay
      }, 1000);
    } catch (error) {
      setUploadError('Gagal mengumpulkan tugas. Silakan coba lagi.');
      console.error('Error submitting assignment:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat detail tugas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="dashboard-container">
        <div className="error-message">Tugas tidak ditemukan</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <div className="dashboard-header" style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
          ← Kembali
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>{assignment.judul}</h1>
        <p style={{ fontSize: '1rem', color: '#555' }}>
          <strong>Kode:</strong> {assignment.kode_tugas || 'N/A'} | <strong>Guru:</strong> {assignment.guru_nama || 'N/A'}
        </p>
        <p style={{ fontSize: '1rem', color: '#555' }}>
          <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleDateString('id-ID')} | <strong>Dibuat:</strong> {new Date(assignment.created_at).toLocaleDateString('id-ID')}
        </p>
        {assignment.deskripsi && (
          <p style={{ marginTop: '15px', fontSize: '1.1rem', lineHeight: '1.5', color: '#333' }}>{assignment.deskripsi}</p>
        )}
      </div>

      {assignment.file_path ? (
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '10px' }}>File Tugas</h3>
          <a 
            href={`http://localhost:5000${assignment.file_path}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '1rem' }}
          >
            Unduh / Lihat File
          </a>
        </div>
      ) : (
        <p style={{ marginTop: '20px', marginBottom: '30px', fontStyle: 'italic', color: '#777' }}>Tidak ada file tugas yang dilampirkan.</p>
      )}

      <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Unggah Tugas Anda</h3>
        {!submissionLoading && submission ? (
          <div style={{ backgroundColor: '#e6ffe6', padding: '15px', borderRadius: '8px' }}>
            <p><strong>Tugas Anda sudah dikumpulkan.</strong></p>
            {submission.file_path ? (
              <>
                <h4>File Tugas yang Dikumpulkan:</h4>
                <a 
                  href={`http://localhost:5000${submission.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-info"
                  style={{ padding: '10px 20px', fontSize: '1rem', marginRight: '10px' }}
                >
                  Lihat Tugas yang Dikumpulkan
                </a>
              </>
            ) : (
              <p style={{ fontStyle: 'italic', color: '#777' }}>Anda belum mengunggah file.</p>
            )}
            <button 
              className="btn btn-warning" 
              onClick={() => {
                setSubmission(null);
                setUploadSuccess('');
                setUploadError('');
              }}
              style={{ padding: '10px 20px', fontSize: '1rem', marginRight: '10px' }}
            >
              Edit Tugas
            </button>
            <button 
              className="btn btn-danger" 
              onClick={async () => {
                try {
                  await submissionsAPI.delete(submission.id);
                  setSubmission(null);
                  setUploadSuccess('');
                  setUploadError('');
                } catch (error) {
                  setUploadError('Gagal menghapus tugas. Silakan coba lagi.');
                  console.error('Error deleting submission:', error);
                }
              }}
              style={{ padding: '10px 20px', fontSize: '1rem' }}
            >
              Hapus Tugas
            </button>
            <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Status: {submission.status === 'graded' ? `Dinilai (Nilai: ${submission.nilai})` : 'Belum dinilai'}
            </p>
            <table className="table table-bordered" style={{ marginTop: '20px' }}>
              <tbody>
                <tr>
                  <th>Submission status</th>
                  <td>{submission.status === 'submitted' ? 'Submitted for grading' : submission.status}</td>
                </tr>
                <tr>
                  <th>Grading status</th>
                  <td>{submission.status === 'graded' ? 'Graded' : 'Not graded'}</td>
                </tr>
                <tr>
                  <th>Last modified</th>
                  <td>{submission.updated_at ? new Date(submission.updated_at).toLocaleString('id-ID') : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Online text</th>
                  <td>
                    {submission.file_path ? (
                      <a 
                        href={`http://localhost:5000${submission.file_path}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {`http://localhost:5000${submission.file_path}`}
                      </a>
                    ) : (
                      <em>No file uploaded</em>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Submission comments</th>
                  <td>
                    {/* Placeholder for comments, can be expanded */}
                    <a href="#comments">Comments (0)</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.7z,.txt"
              style={{ padding: '8px', fontSize: '1rem' }}
            />
            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={uploading} 
              style={{ padding: '10px 20px', fontSize: '1rem', cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              {uploading ? 'Mengunggah...' : 'Kumpulkan Tugas'}
            </button>
          </form>
        )}
        {uploadError && <p className="error-message" style={{ marginTop: '10px' }}>{uploadError}</p>}
        {uploadSuccess && <p className="success-message" style={{ marginTop: '10px' }}>{uploadSuccess}</p>}
      </div>
    </div>
  );
};

export default DetailTugas;
