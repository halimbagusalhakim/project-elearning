import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/dashboard.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [createData, setCreateData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'siswa',
    nama_lengkap: ''
  });
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    role: 'siswa',
    nama_lengkap: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNum) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { page: pageNum, limit: 12 } });
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      setError('Gagal memuat data pengguna');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCreateData({
      ...createData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      await api.post('/admin/users', createData);
      setShowCreateModal(false);
      setCreateData({
        username: '',
        email: '',
        password: '',
        role: 'siswa',
        nama_lengkap: ''
      });
      fetchUsers(page);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.data?.error) {
        setCreateError(error.response.data.error);
      } else {
        setCreateError('Gagal membuat pengguna');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditData({
      username: user.username,
      email: user.email,
      role: user.role,
      nama_lengkap: user.nama_lengkap
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      await api.put('/admin/users/' + selectedUser.id, editData);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditData({
        username: '',
        email: '',
        role: 'siswa',
        nama_lengkap: ''
      });
      fetchUsers(page);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.response?.data?.error) {
        setEditError(error.response.data.error);
      } else {
        setEditError('Gagal mengupdate pengguna');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter === 'all') return true;
    return user.role === roleFilter;
  });

  const handleDeleteUser = async () => {
    setDeleteLoading(true);

    try {
      await api.delete('/admin/users/' + selectedUser.id);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchUsers(page);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus pengguna');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'guru':
        return 'Guru';
      case 'admin':
        return 'Admin';
      case 'siswa':
        return 'Siswa';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'guru':
        return 'role-badge guru';
      case 'siswa':
        return 'role-badge siswa';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Memuat pengguna...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Manajemen Pengguna</h1>
        <p>Kelola pengguna sistem (guru dan siswa)</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="action-bar">
        <div className="action-bar-left">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Buat Pengguna Baru
          </button>
        </div>
        <div className="action-bar-right">
          <div className="filter-group">
            <label htmlFor="role-filter">Filter Role:</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Role</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {users.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada pengguna</h3>
            <p>Belum ada pengguna yang terdaftar dalam sistem.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada pengguna dengan role tersebut</h3>
            <p>Coba ubah filter untuk melihat pengguna lainnya.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className="card">
                <div className="card-header">
                  <h3>{user.nama_lengkap}</h3>
                  <span className={getRoleBadgeClass(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Dibuat:</strong> {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </button>
          <span>Halaman {page} dari {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Buat Pengguna Baru</h2>
            {createError && <div className="error-message">{createError}</div>}
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="nama_lengkap">Nama Lengkap:</label>
                <input
                  type="text"
                  id="nama_lengkap"
                  name="nama_lengkap"
                  value={createData.nama_lengkap}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={createData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={createData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={createData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  name="role"
                  value={createData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                >
                  {createLoading ? 'Membuat...' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Pengguna</h2>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label htmlFor="edit_nama_lengkap">Nama Lengkap:</label>
                <input
                  type="text"
                  id="edit_nama_lengkap"
                  name="nama_lengkap"
                  value={editData.nama_lengkap}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_username">Username:</label>
                <input
                  type="text"
                  id="edit_username"
                  name="username"
                  value={editData.username}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Masukkan username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_email">Email:</label>
                <input
                  type="email"
                  id="edit_email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Masukkan email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_role">Role:</label>
                <select
                  id="edit_role"
                  name="role"
                  value={editData.role}
                  onChange={handleEditInputChange}
                  required
                >
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Mengupdate...' : 'Update Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus pengguna "{selectedUser.nama_lengkap}"?</p>
            <p>Semua data terkait pengguna ini akan dihapus permanen.</p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedUser(null);
                }}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
