# TODO - Sistem Pendaftaran Siswa dengan Konfirmasi Guru

## [x] 1. Database Schema Update
- [x] Tambah tabel class_registrations di database-schema.sql

## [x] 2. Model Class Registration
- [x] Buat file server/models/ClassRegistration.js

## [x] 3. Controller Update
- [x] Update server/controllers/classController.js dengan fungsi pendaftaran

## [x] 4. Routes Update
- [x] Update server/routes/classRoutes.js dengan endpoint baru

## [x] 5. API Client Update
- [x] Update client/src/services/api.js dengan fungsi API baru

## [x] 6. Frontend Update
- [x] Update client/src/pages/DashboardGuru.js dengan UI untuk mengelola pendaftaran
- [x] Update client/src/pages/DashboardSiswa.js dengan UI untuk mendaftar ke kelas

## [x] 7. UI/UX Enhancement
- [x] Buat file CSS untuk dashboard: client/src/styles/dashboard.css
- [x] Update DashboardGuru.js untuk menggunakan styling baru
- [x] Update DashboardSiswa.js untuk menggunakan styling baru
- [x] Buat file CSS untuk auth: client/src/styles/auth.css
- [x] Update LoginPage.js untuk menggunakan styling baru
- [x] Buat file CSS untuk sidebar: client/src/styles/sidebar.css
- [x] Update Sidebar.js dengan desain yang lebih modern
- [x] Update App.js untuk menyesuaikan dengan sidebar baru
- [x] Update index.css untuk styling dasar

## [x] 8. Halaman Khusus untuk Setiap Fitur
- [x] Buat halaman KelasSaya.js untuk siswa
- [x] Buat halaman MateriSaya.js untuk siswa
- [x] Buat halaman TugasSaya.js untuk siswa
- [x] Buat halaman ManajemenKelas.js untuk guru
- [x] Buat halaman ManajemenMateri.js untuk guru
- [x] Buat halaman ManajemenTugas.js untuk guru
- [x] Buat halaman Laporan.js untuk guru
- [x] Buat halaman Profil.js untuk semua pengguna
- [x] Update App.js dengan routing untuk semua halaman baru

## [ ] 9. Testing
- [ ] Test seluruh implementasi
- [ ] Test pendaftaran siswa
- [ ] Test approval/rejection oleh guru
- [ ] Test tampilan daftar siswa yang disetujui
- [ ] Test responsive design
- [ ] Test user experience
- [ ] Test navigasi antar halaman
- [ ] Test fungsionalitas setiap halaman
