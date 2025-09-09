const db = require('../config/db');

class Class {
  static createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_kelas VARCHAR(50) NOT NULL,
        kode_kelas VARCHAR(20) UNIQUE NOT NULL,
        guru_id INT NOT NULL,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    return db.promise().execute(sql);
  }

  static async create(classData) {
    try {
      console.log('Executing SQL query for class creation:', classData);
      const sql = 'INSERT INTO classes (nama_kelas, kode_kelas, guru_id, deskripsi) VALUES (?, ?, ?, ?)';
      const [result] = await db.promise().execute(sql, [
        classData.nama_kelas,
        classData.kode_kelas,
        classData.guru_id,
        classData.deskripsi
      ]);
      console.log('SQL query executed successfully, insertId:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Database error in Class.create:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const sql = `
        SELECT c.*, u.nama_lengkap as guru_nama
        FROM classes c
        LEFT JOIN users u ON c.guru_id = u.id
        ORDER BY c.created_at DESC
      `;
      const [rows] = await db.promise().execute(sql);
      return rows;
    } catch (error) {
      console.error('Error in Class.getAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT c.*, u.nama_lengkap as guru_nama
        FROM classes c
        LEFT JOIN users u ON c.guru_id = u.id
        WHERE c.id = ?
      `;
      const [rows] = await db.promise().execute(sql, [id]);
      const result = rows[0];

      // Ensure proper JSON serialization by explicitly constructing the object
      if (result) {
        return {
          id: result.id,
          nama_kelas: result.nama_kelas,
          kode_kelas: result.kode_kelas,
          guru_id: result.guru_id,
          deskripsi: result.deskripsi,
          created_at: result.created_at,
          updated_at: result.updated_at,
          guru_nama: result.guru_nama
        };
      }
      return null;
    } catch (error) {
      console.error('Error in Class.findById:', error);
      throw error;
    }
  }

  static async findByCode(kode_kelas) {
    const sql = 'SELECT * FROM classes WHERE kode_kelas = ?';
    const [rows] = await db.promise().execute(sql, [kode_kelas]);
    return rows[0];
  }

  static async getClassesByTeacher(guru_id) {
    try {
      const sql = 'SELECT * FROM classes WHERE guru_id = ? ORDER BY created_at DESC';
      const [rows] = await db.promise().execute(sql, [guru_id]);
      return rows;
    } catch (error) {
      console.error('Error in Class.getClassesByTeacher:', error);
      throw error;
    }
  }

  static async update(id, classData) {
    const sql = 'UPDATE classes SET nama_kelas = ?, kode_kelas = ?, deskripsi = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [
      classData.nama_kelas,
      classData.kode_kelas,
      classData.deskripsi,
      id
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = 'DELETE FROM classes WHERE id = ?';
    const [result] = await db.promise().execute(sql, [id]);
    return result.affectedRows;
  }

  static async getTotalCount() {
    const sql = 'SELECT COUNT(*) as total FROM classes';
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getRecentClasses(limit = 5) {
    const limitNum = Math.floor(Number(limit));
    const sql = `SELECT * FROM classes ORDER BY created_at DESC LIMIT ${limitNum}`;
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getClassStatistics() {
    try {
      // Get total classes
      const [totalResult] = await db.promise().execute('SELECT COUNT(*) as total FROM classes');
      const totalClasses = totalResult[0].total;

      // Get classes by teacher
      const [teacherStats] = await db.promise().execute(`
        SELECT u.nama_lengkap as teacher_name, COUNT(c.id) as class_count
        FROM classes c
        JOIN users u ON c.guru_id = u.id
        GROUP BY c.guru_id, u.nama_lengkap
        ORDER BY class_count DESC
      `);

      // Get class registration stats
      const [registrationStats] = await db.promise().execute(`
        SELECT c.nama_kelas, COUNT(cr.id) as student_count
        FROM classes c
        LEFT JOIN class_registrations cr ON c.id = cr.kelas_id AND cr.status = 'approved'
        GROUP BY c.id, c.nama_kelas
        ORDER BY student_count DESC
      `);

      return {
        totalClasses,
        teacherStats,
        registrationStats
      };
    } catch (error) {
      console.error('Error in getClassStatistics:', error);
      throw error;
    }
  }
}

module.exports = Class;
