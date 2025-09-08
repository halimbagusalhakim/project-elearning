const db = require('../config/db');

class User {
  static createTable() {
    const sql = `
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
      )
    `;
    return db.promise().execute(sql);
  }

  static async create(userData) {
    const sql = 'INSERT INTO users (username, email, password, role, nama_lengkap, kelas) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.promise().execute(sql, [
      userData.username,
      userData.email,
      userData.password,
      userData.role,
      userData.nama_lengkap,
      userData.kelas
    ]);
    return result.insertId;
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.promise().execute(sql, [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.promise().execute(sql, [email]);
    return rows[0];
  }

  static async findById(id) {
    const sql = 'SELECT id, username, email, role, nama_lengkap, kelas, created_at FROM users WHERE id = ?';
    const [rows] = await db.promise().execute(sql, [id]);
    return rows[0];
  }

  static async findByIdWithPassword(id) {
    const sql = 'SELECT id, username, email, password, role, nama_lengkap, kelas, created_at FROM users WHERE id = ?';
    const [rows] = await db.promise().execute(sql, [id]);
    return rows[0];
  }

  static async getAllStudents() {
    const sql = 'SELECT id, username, email, nama_lengkap, kelas FROM users WHERE role = "siswa"';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getAllTeachers() {
    const sql = 'SELECT id, username, email, nama_lengkap FROM users WHERE role = "guru"';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async updatePassword(id, newPassword) {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [newPassword, id]);
    return result.affectedRows > 0;
  }

  static async updateProfile(id, profileData) {
    const { nama_lengkap, username, email } = profileData;
    const sql = 'UPDATE users SET nama_lengkap = ?, username = ?, email = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [nama_lengkap, username, email, id]);
    return result.affectedRows > 0;
  }

  // Admin-specific methods
  static async getTotalCount() {
    const sql = 'SELECT COUNT(*) as total FROM users';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getUserStatsByRole() {
    const sql = 'SELECT role, COUNT(*) as count FROM users GROUP BY role';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getAllWithPagination(limit = 50, offset = 0) {
    const sql = 'SELECT id, username, email, role, nama_lengkap, kelas, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await db.promise().execute(sql, [limit, offset]);
    return rows;
  }

  static async updateRole(id, role) {
    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [role, id]);
    return result;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.promise().execute(sql, [id]);
    return result;
  }

  static async getRecentUsers(limit = 10) {
    const sql = 'SELECT id, username, email, role, nama_lengkap, created_at FROM users ORDER BY created_at DESC LIMIT ' + limit;
    const [rows] = await db.promise().execute(sql);
    return rows;
  }
}

module.exports = User;
