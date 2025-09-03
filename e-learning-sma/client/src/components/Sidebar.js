import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const getUserInitials = () => {
    if (!user.nama_lengkap) return 'U';
    return user.nama_lengkap
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>E-Learning SMA</h3>
        <small>Learning Management System</small>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="icon-dashboard"></span>
          Dashboard
        </NavLink>
        
        {user.role === 'guru' && (
          <>
            <NavLink 
              to="/manajemen-kelas" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-class"></span>
              Manajemen Kelas
            </NavLink>
            <NavLink 
              to="/manajemen-materi" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-material"></span>
              Manajemen Materi
            </NavLink>
            <NavLink 
              to="/manajemen-tugas" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-assignment"></span>
              Manajemen Tugas
            </NavLink>
          </>
        )}
        
        {user.role === 'siswa' && (
          <>
            <NavLink 
              to="/kelas-saya" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-class"></span>
              Kelas Saya
            </NavLink>
            <NavLink 
              to="/materi-saya" 
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-material"></span>
              Materi Saya
            </NavLink>
            <NavLink
              to="/tugas-saya"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-assignment"></span>
              Tugas Saya
            </NavLink>
            <NavLink
              to="/laporan-nilai-tugas"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon-report"></span>
              Laporan Nilai Tugas
            </NavLink>

          </>
        )}
        
        <NavLink 
          to="/profil" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="icon-user"></span>
          Profil
        </NavLink>
        

      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {getUserInitials()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user.nama_lengkap || 'User'}
            </div>
            <div className="sidebar-user-role">
              {user.role === 'guru' ? 'Guru' : 'Siswa'}
            </div>
          </div>
        </div>
        
        <button 
          className="sidebar-link"
          onClick={handleLogout}
          style={{ marginTop: '12px', cursor: 'pointer', border: 'none', textAlign: 'left' }}
        >
          <span className="icon-logout"></span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
