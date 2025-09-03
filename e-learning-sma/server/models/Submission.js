const db = require('../config/db');

const Submission = {
  createTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT NOT NULL,
        siswa_id INT NOT NULL,
        file_path VARCHAR(255),
        file_type VARCHAR(50),
        komentar TEXT,
        nilai DECIMAL(5,2),
        status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        graded_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_submission (assignment_id, siswa_id)
      )
    `;
    const [result] = await db.promise().execute(sql);
    return result;
  },

  create: async ({ assignment_id, siswa_id, file_path, file_type, komentar, nilai, status }) => {
    // Ensure all parameters are properly handled for SQL
    const params = [
      assignment_id,
      siswa_id,
      file_path || null,
      file_type || null,
      komentar || null,
      nilai || null,
      status || 'submitted'
    ];

    const [result] = await db.promise().execute(
      `INSERT INTO submissions (assignment_id, siswa_id, file_path, file_type, komentar, nilai, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    return result.insertId;
  },

  findByAssignmentId: async (assignment_id) => {
    const [rows] = await db.promise().execute(
      `SELECT s.*, u.nama_lengkap, u.username
       FROM submissions s
       JOIN users u ON s.siswa_id = u.id
       WHERE s.assignment_id = ?`,
      [assignment_id]
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.promise().execute(
      `SELECT * FROM submissions WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.file_path !== undefined) {
      fields.push('file_path = ?');
      values.push(data.file_path);
    }
    if (data.file_type !== undefined) {
      fields.push('file_type = ?');
      values.push(data.file_type);
    }
    if (data.komentar !== undefined) {
      fields.push('komentar = ?');
      values.push(data.komentar);
    }
    if (data.nilai !== undefined) {
      fields.push('nilai = ?');
      values.push(data.nilai);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      return 0;
    }

    values.push(id);

    const [result] = await db.promise().execute(
      `UPDATE submissions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.promise().execute(
      `DELETE FROM submissions WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
};

module.exports = Submission;
