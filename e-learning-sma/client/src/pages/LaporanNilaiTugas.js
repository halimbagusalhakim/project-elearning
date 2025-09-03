import React, { useEffect, useState } from 'react';
import { classesAPI, assignmentsAPI } from '../services/api';
import '../styles/profile.css';

const LaporanNilaiTugas = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [assignments, setAssignments] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await classesAPI.getStudentRegistrations();
        setClasses(response.data);
        if (response.data.length > 0) {
          setSelectedClassId('all');
        }
      } catch (err) {
        setError('Gagal memuat daftar kelas.');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true);
        setError(null);
        let response;
        if (selectedClassId === 'all') {
          response = await assignmentsAPI.getStudentAssignments();
        } else {
          response = await assignmentsAPI.getStudentClassGrades(selectedClassId);
        }
        setAssignments(response.data || []);
      } catch (err) {
        setError('Gagal memuat nilai tugas.');
        setAssignments([]);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [selectedClassId]);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  return (
    <div className="laporan-nilai-tugas-container" style={{ maxWidth: 600, margin: '0 auto', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: 20 }}>Nilai Tugas Siswa</h2>

      {loadingClasses ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Memuat daftar kelas...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>
      ) : (
        <>
          <label htmlFor="class-select" style={{ display: 'block', marginBottom: 8, fontWeight: '600', color: '#34495e' }}>
            Pilih Kelas:
          </label>
          <select
            id="class-select"
            value={selectedClassId}
            onChange={handleClassChange}
            style={{ padding: 10, width: '100%', marginBottom: 20, borderRadius: 4, border: '1px solid #bdc3c7', fontSize: 16 }}
          >
            <option value="all">Semua Kelas</option>
            {classes.map((kelas) => (
              <option key={kelas.kelas_id || kelas.id} value={kelas.kelas_id || kelas.id}>
                {kelas.nama_kelas || kelas.namaKelas || kelas.kode_kelas || kelas.kodeKelas || 'Kelas'}
              </option>
            ))}
          </select>

          {loadingAssignments ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Memuat nilai tugas...</p>
          ) : assignments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#95a5a6', fontStyle: 'italic' }}>Tidak ada nilai tugas untuk kelas ini.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, borderRadius: 4, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {assignments.map((assignment) => (
                <li
                  key={assignment.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderBottom: '1px solid #ecf0f1',
                    alignItems: 'center',
                    fontSize: 16,
                    color: '#2c3e50',
                    fontWeight: '500',
                  }}
                >
                  <span>{assignment.judul}</span>
                  <span style={{ fontWeight: '700', color: assignment.nilai !== null && assignment.nilai !== undefined ? '#27ae60' : '#7f8c8d' }}>
                    {assignment.nilai !== null && assignment.nilai !== undefined ? assignment.nilai : '-'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default LaporanNilaiTugas;
