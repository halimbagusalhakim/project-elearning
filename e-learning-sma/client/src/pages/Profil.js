import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import '../styles/profile.css';
import { authAPI } from '../services/api';

const Profil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Fetch user profile from API
      const response = await authAPI.getProfile();
      const userData = response.data;
      setUser(userData);
      setFormData({
        nama_lengkap: userData.nama_lengkap || '',
        username: userData.username || '',
        email: userData.email || ''
      });
    } catch (error) {
      setError('Gagal memuat profil');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call API to update profile
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data;

      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profil berhasil diperbarui');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal menyimpan profil');
      console.error('Error saving profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'guru': return '#10b981';
      case 'siswa': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'guru': return '👨‍🏫';
      case 'siswa': return '👨‍🎓';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Profil Saya</h1>
        <p>Kelola informasi profil Anda</p>
      </div>

      {error && <div className="error-message animated">{error}</div>}
      {success && <div className="success-message animated">{success}</div>}

      <div className="profile-cards-grid">
        {/* Profile Card */}
        <div className="profile-main-card interactive-card">
          <div className="card-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar animated">
                {getInitials(user?.nama_lengkap)}
              </div>
              <div className="avatar-badge">
                {getRoleIcon(user?.role)}
              </div>
            </div>
            <div className="profile-info">
              <h2 className="animated-text">{user?.nama_lengkap || 'User'}</h2>
              <div className="role-badge" style={{ backgroundColor: getRoleColor(user?.role) }}>
                {user?.role === 'guru' ? 'Guru' : 'Siswa'}
              </div>
            </div>
          </div>

          {!editMode ? (
            <div className="profile-details">
              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-icon">📧</div>
                  <div className="detail-content">
                    <label>Email</label>
                    <span>{user?.email || '-'}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">👤</div>
                  <div className="detail-content">
                    <label>Username</label>
                    <span>{user?.username || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-form animated">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nama_lengkap">Nama Lengkap</label>
                  <input
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    required
                    className="animated-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="animated-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="animated-input"
                  />
                </div>
              </div>
              <div className="card-actions">
                <button
                  type="submit"
                  className="btn btn-primary animated-btn"
                  disabled={saveLoading}
                >
                  <span className="btn-icon">{saveLoading ? '⏳' : '💾'}</span>
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary animated-btn"
                  onClick={() => {
                    setEditMode(false);
                    loadUserProfile();
                  }}
                >
                  <span className="btn-icon">❌</span>
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="card-actions">
            {!editMode ? (
              <button
                className="btn btn-primary animated-btn"
                onClick={() => setEditMode(true)}
              >
                <span className="btn-icon">✏️</span>
                Edit Profil
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="profile-main-card interactive-card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2>Ubah Password</h2>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const currentPassword = e.target.currentPassword.value;
            const newPassword = e.target.newPassword.value;
            const confirmPassword = e.target.confirmPassword.value;

            if (newPassword !== confirmPassword) {
              alert('Password baru dan konfirmasi tidak cocok.');
              return;
            }

        // Call actual password change API
        try {
          await authAPI.changePassword({ currentPassword, newPassword });
          alert('Password berhasil diubah.');
          e.target.reset();
        } catch (error) {
          console.error('Error changing password:', error);
          alert('Gagal mengubah password: ' + (error.response?.data?.error || 'Terjadi kesalahan'));
        }
          }}
          className="profile-form animated"
        >
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="currentPassword">Password Saat Ini</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="animated-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Password Baru</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                className="animated-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="animated-input"
              />
            </div>
          </div>
          <div className="card-actions" style={{ justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary animated-btn">
              <span className="btn-icon">🔒</span>
              Ubah Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profil;

