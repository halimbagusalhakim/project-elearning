const db = require('../config/db');

class ClassRegistration {
  static createTable() {
    const sql = `
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
      )
    `;
    return db.promise().execute(sql);
  }

  static async create(registrationData) {
    try {
      const sql = 'INSERT INTO class_registrations (kelas_id, siswa_id, status) VALUES (?, ?, ?)';
      const [result] = await db.promise().execute(sql, [
        registrationData.kelas_id,
        registrationData.siswa_id,
        registrationData.status || 'pending'
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Database error in ClassRegistration.create:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM class_registrations WHERE id = ?';
      const [rows] = await db.promise().execute(sql, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in ClassRegistration.findById:', error);
      throw error;
    }
  }

  static async findByClassAndStudent(kelas_id, siswa_id) {
    try {
      const sql = 'SELECT * FROM class_registrations WHERE kelas_id = ? AND siswa_id = ?';
      const [rows] = await db.promise().execute(sql, [kelas_id, siswa_id]);
      return rows[0];
    } catch (error) {
      console.error('Error in ClassRegistration.findByClassAndStudent:', error);
      throw error;
    }
  }

  static async getPendingRegistrationsByClass(kelas_id) {
    try {
      const sql = `
        SELECT cr.*, u.nama_lengkap, u.username, u.kelas as kelas_siswa
        FROM class_registrations cr
        JOIN users u ON cr.siswa_id = u.id
        WHERE cr.kelas_id = ? AND cr.status = 'pending'
        ORDER BY cr.created_at DESC
      `;
      const [rows] = await db.promise().execute(sql, [kelas_id]);
      return rows;
    } catch (error) {
      console.error('Error in ClassRegistration.getPendingRegistrationsByClass:', error);
      throw error;
    }
  }

  static async getApprovedStudentsByClass(kelas_id) {
    try {
      const sql = `
        SELECT cr.*, u.nama_lengkap, u.username, u.kelas as kelas_siswa
        FROM class_registrations cr
        JOIN users u ON cr.siswa_id = u.id
        WHERE cr.kelas_id = ? AND cr.status = 'approved'
        ORDER BY u.nama_lengkap ASC
      `;
      const [rows] = await db.promise().execute(sql, [kelas_id]);
      return rows;
    } catch (error) {
      console.error('Error in ClassRegistration.getApprovedStudentsByClass:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const sql = 'UPDATE class_registrations SET status = ? WHERE id = ?';
      const [result] = await db.promise().execute(sql, [status, id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in ClassRegistration.updateStatus:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sql = 'DELETE FROM class_registrations WHERE id = ?';
      const [result] = await db.promise().execute(sql, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error in ClassRegistration.delete:', error);
      throw error;
    }
  }

  static async getStudentRegistrations(siswa_id) {
    try {
      const sql = `
        SELECT cr.*, c.nama_kelas, c.kode_kelas, u.nama_lengkap as guru_nama
        FROM class_registrations cr
        JOIN classes c ON cr.kelas_id = c.id
        JOIN users u ON c.guru_id = u.id
        WHERE cr.siswa_id = ?
        ORDER BY cr.created_at DESC
      `;
      const [rows] = await db.promise().execute(sql, [siswa_id]);
      return rows;
    } catch (error) {
      console.error('Error in ClassRegistration.getStudentRegistrations:', error);
      throw error;
    }
  }
}

module.exports = ClassRegistration;
