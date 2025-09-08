const db = require('../config/db');

class Material {
  static createTable() {
    const sql = `
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
      )
    `;
    return db.promise().execute(sql);
  }

  static async create(materialData) {
    const sql = 'INSERT INTO materials (kelas_id, judul, deskripsi, file_path, file_type, created_by) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.promise().execute(sql, [
      materialData.kelas_id,
      materialData.judul,
      materialData.deskripsi,
      materialData.file_path,
      materialData.file_type,
      materialData.created_by
    ]);
    return result.insertId;
  }

  static async getByClassId(kelas_id) {
    const sql = `
      SELECT m.*, u.nama_lengkap as created_by_name 
      FROM materials m 
      JOIN users u ON m.created_by = u.id 
      WHERE m.kelas_id = ? 
      ORDER BY m.created_at DESC
    `;
    const [rows] = await db.promise().execute(sql, [kelas_id]);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT m.*, u.nama_lengkap as created_by_name, c.nama_kelas
      FROM materials m 
      JOIN users u ON m.created_by = u.id 
      JOIN classes c ON m.kelas_id = c.id 
      WHERE m.id = ?
    `;
    const [rows] = await db.promise().execute(sql, [id]);
    return rows[0];
  }

  static async update(id, materialData) {
    const sql = 'UPDATE materials SET judul = ?, deskripsi = ?, file_path = ?, file_type = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [
      materialData.judul,
      materialData.deskripsi,
      materialData.file_path,
      materialData.file_type,
      id
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = 'DELETE FROM materials WHERE id = ?';
    const [result] = await db.promise().execute(sql, [id]);
    return result.affectedRows;
  }

  static async getRecentMaterials(limit = 10) {
    try {
      // First try a simple query without joins
      const sql = `
        SELECT * FROM materials
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      console.log('Executing simple SQL for recent materials:', sql, 'with limit:', limit);
      const [rows] = await db.promise().execute(sql, [limit]);
      return rows;
    } catch (error) {
      console.error('Error in Material.getRecentMaterials:', error);
      throw error;
    }
  }

  static async getStudentMaterials(studentId) {
    try {
      const sql = `
        SELECT m.*, u.nama_lengkap as created_by_name, c.nama_kelas
        FROM materials m
        JOIN users u ON m.created_by = u.id
        JOIN classes c ON m.kelas_id = c.id
        JOIN class_registrations cr ON c.id = cr.kelas_id
        WHERE cr.siswa_id = ? AND cr.status = 'approved'
        ORDER BY m.created_at DESC
      `;
      const [rows] = await db.promise().execute(sql, [studentId]);
      return rows;
    } catch (error) {
      console.error('Error in Material.getStudentMaterials:', error);
      throw error;
    }
  }

  static async getTotalCount() {
    const sql = 'SELECT COUNT(*) as total FROM materials';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }
}

module.exports = Material;
