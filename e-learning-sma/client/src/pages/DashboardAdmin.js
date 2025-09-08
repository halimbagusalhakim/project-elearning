import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import api from '../services/api';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalMaterials: 0,
    totalAssignments: 0,
  });
  const [userStats, setUserStats] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentClasses, setRecentClasses] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);

  useEffect(() => {
    // Fetch system statistics from backend API
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        const data = res.data;

        setStats({
          totalUsers: data.stats.totalUsers,
          totalClasses: data.stats.totalClasses,
          totalMaterials: data.stats.totalMaterials,
          totalAssignments: data.stats.totalAssignments,
        });

        setUserStats(data.stats.userStats);
        setRecentUsers(data.recent.users);
        setRecentClasses(data.recent.classes);
        setRecentMaterials(data.recent.materials);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard Admin</h2>
      <p>Selamat datang di panel administrasi e-learning SMA</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Statistik Sistem</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Pengguna</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalClasses}</div>
              <div className="stat-label">Total Kelas</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalMaterials}</div>
              <div className="stat-label">Total Materi</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalAssignments}</div>
              <div className="stat-label">Total Tugas</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Statistik Pengguna</h3>
          <ul className="user-stats-list">
            {userStats.map((stat) => (
              <li key={stat.role}>
                <span className="role-label">{stat.role.charAt(0).toUpperCase() + stat.role.slice(1)}</span>
                <span className="role-count">{stat.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h3>Pengguna Terbaru</h3>
          <ul className="recent-users-list">
            {recentUsers.map((user) => (
              <li key={user.id} className="recent-user-item">
                <strong>{user.nama_lengkap}</strong>
                <div>Username: {user.username}</div>
                <div>Role: {user.role}</div>
                <div>Dibuat: {new Date(user.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h3>Kelas Terbaru</h3>
          <ul className="recent-classes-list">
            {recentClasses.map((kelas) => (
              <li key={kelas.id} className="recent-class-item">
                <strong>{kelas.nama_kelas}</strong>
                <div>Guru: {kelas.guru_nama}</div>
                <div>Dibuat: {new Date(kelas.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h3>Materi Terbaru</h3>
          <ul className="recent-materials-list">
            {recentMaterials.map((material) => (
              <li key={material.id} className="recent-material-item">
                <strong>{material.judul}</strong>
                <div>Oleh: {material.created_by_name}</div>
                <div>Dibuat: {new Date(material.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
