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
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Debug: Log user role and current path
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('DashboardAdmin user role:', user.role);
    console.log('Current URL:', window.location.pathname);
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Dashboard Admin</h2>
      <p className="dashboard-subtitle">Selamat datang di panel administrasi e-learning SMA</p>

      <div className="dashboard-grid">
        <div className="card card-hover">
          <h3>Statistik Sistem</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Pengguna</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalClasses}</div>
              <div className="stat-label">Total Kelas</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalMaterials}</div>
              <div className="stat-label">Total Materi</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalAssignments}</div>
              <div className="stat-label">Total Tugas</div>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <h3>Statistik Pengguna</h3>
          <ul className="user-stats-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {userStats.map((stat) => (
              <li key={stat.role} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span className="role-label" style={{ fontWeight: '600', textTransform: 'capitalize' }}>{stat.role}</span>
                <span className="role-count" style={{ fontWeight: '700' }}>{stat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
