-- E-Learning SMA Database Schema
-- This schema will be automatically created when the application starts

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('siswa', 'guru', 'admin') NOT NULL DEFAULT 'siswa',
    nama_lengkap VARCHAR(100) NOT NULL,
    kelas VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kelas VARCHAR(50) NOT NULL,
    kode_kelas VARCHAR(20) UNIQUE NOT NULL,
    guru_id INT NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kelas_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    file_path VARCHAR(255),
    file_type VARCHAR(50),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kelas_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    file_path VARCHAR(255),
    file_type VARCHAR(50),
    deadline DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Class Registrations table for student enrollment with teacher approval
CREATE TABLE IF NOT EXISTS class_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kelas_id INT NOT NULL,
    siswa_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kelas_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (kelas_id, siswa_id)
);

-- Sample data for testing
INSERT INTO users (username, email, password, role, nama_lengkap, kelas) VALUES
('guru1', 'guru1@sekolah.sch.id', 'password123', 'guru', 'Budi Santoso', NULL),
('siswa1', 'siswa1@sekolah.sch.id', 'password123', 'siswa', 'Andi Wijaya', 'X IPA 1'),
('siswa2', 'siswa2@sekolah.sch.id', 'password123', 'siswa', 'Siti Rahayu', 'X IPA 1');

INSERT INTO classes (nama_kelas, kode_kelas, guru_id, deskripsi) VALUES
('Matematika Kelas X', 'MATH-X-001', 1, 'Materi matematika untuk kelas X'),
('Fisika Kelas X', 'FIS-X-001', 1, 'Materi fisika untuk kelas X');

-- Sample approved registrations (changed from pending to approved)
INSERT INTO class_registrations (kelas_id, siswa_id, status) VALUES
(1, 2, 'approved'),
(1, 3, 'approved'),
(2, 2, 'approved');

-- Sample assignments
INSERT INTO assignments (kelas_id, judul, deskripsi, deadline, created_by) VALUES
(1, 'Tugas Matematika Bab 1', 'Kerjakan soal nomor 1-10 halaman 15', '2024-12-31 23:59:59', 1),
(1, 'Tugas Matematika Bab 2', 'Kerjakan soal nomor 1-15 halaman 25', '2024-12-25 23:59:59', 1),
(2, 'Tugas Fisika Bab 1', 'Kerjakan soal nomor 1-8 halaman 12', '2024-12-30 23:59:59', 1);

-- Sample submissions
INSERT INTO submissions (assignment_id, siswa_id, komentar, status) VALUES
(1, 2, 'Sudah selesai mengerjakan', 'submitted'),
(2, 2, 'Sedang mengerjakan', 'submitted');

-- Show table structure
DESCRIBE users;
DESCRIBE classes;
DESCRIBE materials;
DESCRIBE assignments;
