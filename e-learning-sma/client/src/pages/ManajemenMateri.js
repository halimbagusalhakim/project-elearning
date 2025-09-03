import React, { useState, useEffect } from 'react';
import { materialsAPI, classesAPI } from '../services/api';
import '../styles/dashboard.css';

const ManajemenMateri = () => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classMaterials, setClassMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    kelas_id: '',
    judul: '',
    deskripsi: '',
    file: null,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    judul: '',
    deskripsi: '',
    file: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (selectedClass) {
      setCreateData((prev) => ({ ...prev, kelas_id: selectedClass.id }));
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getTeacherClasses();
      setTeacherClasses(response.data);
    } catch (err) {
      setError('Gagal memuat kelas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassMaterials = async (classId) => {
    try {
      setMaterialsLoading(true);
      const response = await materialsAPI.getByClass(classId);
      setClassMaterials(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleClassClick = async (classItem) => {
    setSelectedClass(classItem);
    await fetchClassMaterials(classItem.id);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassMaterials([]);
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const formData = new FormData();
      formData.append('kelas_id', createData.kelas_id);
      formData.append('judul', createData.judul);
      formData.append('deskripsi', createData.deskripsi);
      if (createData.file) {
        formData.append('file', createData.file);
      }

      await materialsAPI.create(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowCreateModal(false);
      setCreateData({ kelas_id: '', judul: '', deskripsi: '', file: null });
      if (selectedClass) {
        await fetchClassMaterials(selectedClass.id);
      }
    } catch (err) {
      console.error(err);
      setCreateError('Gagal membuat materi');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setCreateData({ ...createData, file: files[0] });
    } else {
      setCreateData({ ...createData, [name]: value });
    }
  };

  // Edit handlers
  const openEditModal = (material) => {
    setEditData({
      id: material.id,
      judul: material.judul,
      deskripsi: material.deskripsi,
      file: null,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setEditData({ ...editData, file: files[0] });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('judul', editData.judul);
      formData.append('deskripsi', editData.deskripsi);
      if (editData.file) {
        formData.append('file', editData.file);
      }

      await materialsAPI.update(editData.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowEditModal(false);
      setEditData({ id: '', judul: '', deskripsi: '', file: null });
      if (selectedClass) {
        await fetchClassMaterials(selectedClass.id);
      }
    } catch (err) {
      console.error(err);
      setEditError('Gagal memperbarui materi');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      return;
    }
    try {
      await materialsAPI.delete(id);
      setDeleteError('');
      if (selectedClass) {
        await fetchClassMaterials(selectedClass.id);
      }
    } catch (err) {
      console.error('Gagal menghapus materi:', err);
      setDeleteError('Gagal menghapus materi');
    }
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
        <h1>Manajemen Materi</h1>
        <p>Kelola materi pembelajaran</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {deleteError && <div className="error-message">{deleteError}</div>}

      <div className="content-grid">
        {!selectedClass ? (
          teacherClasses.length === 0 ? (
            <div className="empty-state">
              <h3>Belum ada kelas</h3>
              <p>Anda belum membuat kelas apapun.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {teacherClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="card clickable"
                  onClick={() => handleClassClick(classItem)}
                >
                  <div className="card-header">
                    <h3>{classItem.nama_kelas}</h3>
                    <span className="class-code">{classItem.kode_kelas}</span>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>Kode Kelas:</strong> {classItem.kode_kelas}
                    </p>
                    <p>
                      <strong>Jumlah Siswa:</strong> {classItem.jumlah_siswa || 0} siswa
                    </p>
                    {classItem.deskripsi && (
                      <p>
                        <strong>Deskripsi:</strong> {classItem.deskripsi}
                      </p>
                    )}
                    <p>
                      <strong>Dibuat:</strong>{' '}
                      {new Date(classItem.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary">Lihat Materi</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="back-button-container">
              <button className="btn btn-secondary" onClick={handleBackToClasses}>
                ← Kembali ke Daftar Kelas
              </button>
              <h2>Materi untuk {selectedClass.nama_kelas}</h2>
            </div>

            <div className="action-bar">
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                + Tambah Materi Baru
              </button>
            </div>

            {materialsLoading ? (
              <div className="loading">Memuat materi...</div>
            ) : classMaterials.length === 0 ? (
              <div className="empty-state">
                <h3>Belum ada materi</h3>
                <p>Belum ada materi untuk kelas ini.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {classMaterials.map((material) => (
                  <div key={material.id} className="card">
                    <div className="card-header">
                      <h3>{material.judul}</h3>
                      <span className="material-type">{material.file_type || 'Teks'}</span>
                    </div>
                    <div className="card-body">
                      <p>
                        <strong>Deskripsi:</strong> {material.deskripsi}
                      </p>
                      <p>
                        <strong>Dibuat oleh:</strong> {material.created_by_name}
                      </p>
                      <p>
                        <strong>Tanggal:</strong>{' '}
                        {new Date(material.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="card-footer">
                      {material.file_path ? (
                        <a
                          href={`http://localhost:5000${material.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          Download Materi
                        </a>
                      ) : (
                        <span className="no-file">Tidak ada file</span>
                      )}
                      <button className="btn btn-primary" onClick={() => openEditModal(material)}>Edit Materi</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteMaterial(material.id)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Tambah Materi Baru</h2>
            {createError && <div className="error-message">{createError}</div>}
            <form onSubmit={handleCreateMaterial}>
              <div className="form-group">
                {/* Removed Pilih Kelas dropdown as kelas_id is set automatically */}
              </div>
              <div className="form-group">
                <label htmlFor="judul">Judul Materi:</label>
                <input
                  type="text"
                  id="judul"
                  name="judul"
                  value={createData.judul}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Upload File:</label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Materi</h2>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleUpdateMaterial}>
              <div className="form-group">
                <label htmlFor="judul">Judul Materi:</label>
                <input
                  type="text"
                  id="edit-judul"
                  name="judul"
                  value={editData.judul}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deskripsi">Deskripsi:</label>
                <textarea
                  id="edit-deskripsi"
                  name="deskripsi"
                  value={editData.deskripsi}
                  onChange={handleEditInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Upload File (opsional):</label>
                <input
                  type="file"
                  id="edit-file"
                  name="file"
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenMateri;
