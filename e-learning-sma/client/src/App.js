import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardSiswa from './pages/DashboardSiswa';
import DashboardGuru from './pages/DashboardGuru';
import Sidebar from './components/Sidebar';

import KelasSaya from './pages/KelasSaya';
import DetailKelas from './pages/DetailKelas';
import MateriSaya from './pages/MateriSaya';
import TugasSaya from './pages/TugasSaya';

import ManajemenKelas from './pages/ManajemenKelas';
import ManajemenMateri from './pages/ManajemenMateri';
import ManajemenTugas from './pages/ManajemenTugas';

import Profil from './pages/Profil';
import DetailTugas from './pages/DetailTugas';
import LaporanNilaiTugas from './pages/LaporanNilaiTugas';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <Router>
      {isAuthenticated() && <Sidebar />}
      <div style={{ 
        marginLeft: isAuthenticated() ? '280px' : '0', 
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/dashboard" element={isAuthenticated() ? (user.role === 'guru' ? <DashboardGuru /> : <DashboardSiswa />) : <Navigate to="/" />} />

          {/* Routes for siswa */}
          <Route path="/kelas-saya" element={isAuthenticated() && user.role === 'siswa' ? <KelasSaya /> : <Navigate to="/" />} />
          <Route path="/kelas/:id" element={isAuthenticated() && user.role === 'siswa' ? <DetailKelas /> : <Navigate to="/" />} />
          <Route path="/materi-saya" element={isAuthenticated() && user.role === 'siswa' ? <MateriSaya /> : <Navigate to="/" />} />
          <Route path="/tugas-saya" element={isAuthenticated() && user.role === 'siswa' ? <TugasSaya /> : <Navigate to="/" />} />
          <Route path="/laporan-nilai-tugas" element={isAuthenticated() && user.role === 'siswa' ? <LaporanNilaiTugas /> : <Navigate to="/" />} />

          {/* Routes for guru */}
          <Route path="/manajemen-kelas" element={isAuthenticated() && user.role === 'guru' ? <ManajemenKelas /> : <Navigate to="/" />} />
          <Route path="/manajemen-materi" element={isAuthenticated() && user.role === 'guru' ? <ManajemenMateri /> : <Navigate to="/" />} />
          <Route path="/manajemen-tugas" element={isAuthenticated() && user.role === 'guru' ? <ManajemenTugas /> : <Navigate to="/" />} />

          {/* Common routes */}
          <Route path="/profil" element={isAuthenticated() ? <Profil /> : <Navigate to="/" />} />

          {/* Task detail route */}
          <Route path="/tugas/:id" element={isAuthenticated() ? <DetailTugas /> : <Navigate to="/" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
