const db = require('../config/db');

class Assignment {
  static createTable() {
    const sql = `
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
      )
    `;
    return db.promise().execute(sql);
  }

  static async create(assignmentData) {
    const sql = 'INSERT INTO assignments (kelas_id, judul, deskripsi, file_path, file_type, deadline, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.promise().execute(sql, [
      assignmentData.kelas_id,
      assignmentData.judul,
      assignmentData.deskripsi,
      assignmentData.file_path,
      assignmentData.file_type,
      assignmentData.deadline,
      assignmentData.created_by
    ]);
    return result.insertId;
  }

  static async getByClassId(kelas_id) {
    const sql = `
      SELECT a.*, u.nama_lengkap as created_by_name
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      WHERE a.kelas_id = ?
      ORDER BY a.created_at DESC
    `;
    const [rows] = await db.promise().execute(sql, [kelas_id]);
    return rows;
  }

  static async getByTeacherId(teacher_id) {
    const sql = `
      SELECT a.*, u.nama_lengkap as created_by_name, c.nama_kelas
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      JOIN classes c ON a.kelas_id = c.id
      WHERE a.created_by = ?
      ORDER BY a.created_at DESC
    `;
    const [rows] = await db.promise().execute(sql, [teacher_id]);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT a.*, u.nama_lengkap as created_by_name, c.nama_kelas
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      JOIN classes c ON a.kelas_id = c.id
      WHERE a.id = ?
    `;
    const [rows] = await db.promise().execute(sql, [id]);
    return rows[0];
  }

  static async update(id, assignmentData) {
    const sql = 'UPDATE assignments SET judul = ?, deskripsi = ?, file_path = ?, file_type = ?, deadline = ? WHERE id = ?';
    const [result] = await db.promise().execute(sql, [
      assignmentData.judul,
      assignmentData.deskripsi,
      assignmentData.file_path,
      assignmentData.file_type,
      assignmentData.deadline,
      id
    ]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = 'DELETE FROM assignments WHERE id = ?';
    const [result] = await db.promise().execute(sql, [id]);
    return result.affectedRows;
  }

  static async getUpcomingAssignments(limit = 10) {
    const sql = `
      SELECT a.*, u.nama_lengkap as created_by_name, c.nama_kelas
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      JOIN classes c ON a.kelas_id = c.id
      WHERE a.deadline > NOW()
      ORDER BY a.deadline ASC
      LIMIT ${limit}
    `;
    const [rows] = await db.promise().execute(sql);
    return rows;
  }


  static async getOverdueAssignments() {
    const sql = `
      SELECT a.*, u.nama_lengkap as created_by_name, c.nama_kelas
      FROM assignments a
      JOIN users u ON a.created_by = u.id
      JOIN classes c ON a.kelas_id = c.id
      WHERE a.deadline < NOW()
      ORDER BY a.deadline DESC
    `;
    const [rows] = await db.promise().execute(sql);
    return rows;
  }

  static async getClassStats(classId) {
    try {
      // Get total students in class
      const [studentsResult] = await db.promise().execute(`
        SELECT COUNT(*) as total_students
        FROM class_registrations
        WHERE kelas_id = ? AND status = 'approved'
      `, [classId]);
      const totalStudents = studentsResult[0].total_students;

      // Get total assignments
      const [assignmentsResult] = await db.promise().execute(`
        SELECT COUNT(*) as total_assignments
        FROM assignments
        WHERE kelas_id = ?
      `, [classId]);
      const totalAssignments = assignmentsResult[0].total_assignments;

      // Get total materials
      const [materialsResult] = await db.promise().execute(`
        SELECT COUNT(*) as total_materials
        FROM materials
        WHERE kelas_id = ?
      `, [classId]);
      const totalMaterials = materialsResult[0].total_materials;

      // Get assignments with submission stats
      const [assignments] = await db.promise().execute(`
        SELECT
          a.id,
          a.judul,
          a.deadline,
          COUNT(s.id) as submitted_count,
          ? as total_students
        FROM assignments a
        LEFT JOIN submissions s ON a.id = s.assignment_id
        WHERE a.kelas_id = ?
        GROUP BY a.id, a.judul, a.deadline
        ORDER BY a.created_at DESC
      `, [totalStudents, classId]);

      // Calculate average submission rate
      let totalSubmissionRate = 0;
      if (assignments.length > 0) {
        assignments.forEach(assignment => {
          const rate = totalStudents > 0 ? (assignment.submitted_count / totalStudents) * 100 : 0;
          totalSubmissionRate += rate;
        });
        totalSubmissionRate = Math.round(totalSubmissionRate / assignments.length);
      }

      // Get student performance data
      const [students] = await db.promise().execute(`
        SELECT
          u.id,
          u.nama_lengkap,
          COUNT(DISTINCT s.assignment_id) as submitted_assignments,
          AVG(s.nilai) as average_grade
        FROM users u
        JOIN class_registrations cr ON u.id = cr.siswa_id
        LEFT JOIN submissions s ON u.id = s.siswa_id AND s.assignment_id IN (
          SELECT id FROM assignments WHERE kelas_id = ?
        )
        WHERE cr.kelas_id = ? AND cr.status = 'approved'
        GROUP BY u.id, u.nama_lengkap
        ORDER BY u.nama_lengkap ASC
      `, [classId, classId]);

      // Get materials with engagement
      const [materials] = await db.promise().execute(`
        SELECT
          m.id,
          m.judul,
          m.created_at,
          0 as access_count,
          0 as download_count
        FROM materials m
        WHERE m.kelas_id = ?
        ORDER BY m.created_at DESC
      `, [classId]);

      return {
        total_students: totalStudents,
        total_assignments: totalAssignments,
        total_materials: totalMaterials,
        avg_submission_rate: totalSubmissionRate,
        assignments: assignments.map(a => ({
          id: a.id,
          judul: a.judul,
          deadline: a.deadline,
          submitted_count: a.submitted_count,
          total_students: a.total_students
        })),
        students: students.map(s => ({
          id: s.id,
          nama_lengkap: s.nama_lengkap,
          submitted_assignments: s.submitted_assignments || 0,
          average_grade: s.average_grade ? parseFloat(s.average_grade).toFixed(2) : null
        })),
        materials: materials
      };
    } catch (error) {
      console.error('Error in getClassStats:', error);
      throw error;
    }
  }

  // Get assignments for a specific student
  static async getByStudentId(studentId) {
    console.log('getByStudentId called with studentId:', studentId);

    const sql = `
      SELECT
        a.*,
        u.nama_lengkap as created_by_name,
        c.nama_kelas,
        c.kode_kelas,
        s.id as submission_id,
        s.nilai,
        s.submitted_at,
        s.status as submission_status
      FROM assignments a
      JOIN classes c ON a.kelas_id = c.id
      JOIN users u ON a.created_by = u.id
      JOIN class_registrations cr ON c.id = cr.kelas_id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.siswa_id = ?
      WHERE cr.siswa_id = ? AND cr.status = 'approved'
      ORDER BY a.deadline ASC
    `;

    console.log('Executing SQL query for student assignments:', sql);
    console.log('Query parameters:', [studentId, studentId]);

    const [rows] = await db.promise().execute(sql, [studentId, studentId]);

    console.log('SQL query result:', {
      rowCount: rows ? rows.length : 0,
      rows: rows
    });

    if (!rows) {
      console.log('No rows returned from query, returning empty array');
      return [];
    }

    console.log('Returning assignments from model');
    return rows;
  }

  // Get student performance stats across all classes
  static async getStudentStats(studentId) {
    try {
      // Combine queries into a single query to reduce round trips
      const [results] = await db.promise().query(`
        SELECT
          (SELECT COUNT(*) FROM assignments a
           JOIN classes c ON a.kelas_id = c.id
           JOIN class_registrations cr ON c.id = cr.kelas_id
           WHERE cr.siswa_id = ? AND cr.status = 'approved') AS total_assignments,
          (SELECT COUNT(*) FROM submissions s WHERE s.siswa_id = ?) AS submitted_assignments,
          (SELECT AVG(s.nilai) FROM submissions s WHERE s.siswa_id = ? AND s.nilai IS NOT NULL) AS average_grade
      `, [studentId, studentId, studentId]);

      const totalAssignments = results[0].total_assignments;
      const submittedAssignments = results[0].submitted_assignments;
      const averageGrade = results[0].average_grade;

      // Get performance by class
      const [classPerformance] = await db.promise().execute(`
        SELECT
          c.id,
          c.nama_kelas,
          c.kode_kelas,
          COUNT(DISTINCT a.id) as total_assignments,
          COUNT(DISTINCT s.id) as submitted_assignments,
          AVG(s.nilai) as average_grade
        FROM classes c
        JOIN class_registrations cr ON c.id = cr.kelas_id
        LEFT JOIN assignments a ON c.id = a.kelas_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.siswa_id = ?
        WHERE cr.siswa_id = ? AND cr.status = 'approved'
        GROUP BY c.id, c.nama_kelas, c.kode_kelas
        ORDER BY c.nama_kelas ASC
      `, [studentId, studentId]);

      // Get recent submissions
      const [recentSubmissions] = await db.promise().execute(`
        SELECT
          s.id,
          s.nilai,
          s.submitted_at,
          a.judul as assignment_title,
          c.nama_kelas,
          c.kode_kelas
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN classes c ON a.kelas_id = c.id
        WHERE s.siswa_id = ?
        ORDER BY s.submitted_at DESC
        LIMIT 10
      `, [studentId]);

      return {
        total_assignments: totalAssignments,
        submitted_assignments: submittedAssignments,
        average_grade: averageGrade ? parseFloat(averageGrade).toFixed(2) : null,
        submission_rate: totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
        class_performance: classPerformance.map(cp => ({
          id: cp.id,
          nama_kelas: cp.nama_kelas,
          kode_kelas: cp.kode_kelas,
          total_assignments: cp.total_assignments,
          submitted_assignments: cp.submitted_assignments,
          average_grade: cp.average_grade ? parseFloat(cp.average_grade).toFixed(2) : null,
          submission_rate: cp.total_assignments > 0 ? Math.round((cp.submitted_assignments / cp.total_assignments) * 100) : 0
        })),
        recent_submissions: recentSubmissions
      };
    } catch (error) {
      console.error('Error in getStudentStats:', error);
      throw error;
    }
  }

  // Get student performance stats for a specific class
  static async getStudentClassStats(studentId, classId) {
    try {
      // Get class info
      const [classInfo] = await db.promise().execute(`
        SELECT c.nama_kelas, c.kode_kelas
        FROM classes c
        WHERE c.id = ?
      `, [classId]);
      const classData = classInfo[0];

      // Get assignments for this class
      const [assignments] = await db.promise().execute(`
        SELECT
          a.id,
          a.judul,
          a.deskripsi,
          a.deadline,
          a.created_at,
          s.id as submission_id,
          s.nilai,
          s.submitted_at,
          s.status as submission_status
        FROM assignments a
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.siswa_id = ?
        WHERE a.kelas_id = ?
        ORDER BY a.deadline ASC
      `, [studentId, classId]);

      // Calculate stats
      const totalAssignments = assignments.length;
      const submittedAssignments = assignments.filter(a => a.submission_id).length;
      const gradedAssignments = assignments.filter(a => a.nilai).length;
      const averageGrade = assignments.length > 0
        ? assignments.filter(a => a.nilai).reduce((sum, a) => sum + parseFloat(a.nilai), 0) / gradedAssignments
        : 0;

      // Get grade distribution
      const gradeRanges = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
      assignments.forEach(assignment => {
        if (assignment.nilai) {
          const grade = parseFloat(assignment.nilai);
          if (grade >= 85) gradeRanges['A']++;
          else if (grade >= 75) gradeRanges['B']++;
          else if (grade >= 65) gradeRanges['C']++;
          else if (grade >= 55) gradeRanges['D']++;
          else gradeRanges['F']++;
        }
      });

      return {
        class_info: classData,
        total_assignments: totalAssignments,
        submitted_assignments: submittedAssignments,
        graded_assignments: gradedAssignments,
        average_grade: averageGrade ? parseFloat(averageGrade).toFixed(2) : null,
        submission_rate: totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0,
        grade_distribution: gradeRanges,
        assignments: assignments.map(a => ({
          id: a.id,
          judul: a.judul,
          deskripsi: a.deskripsi,
          deadline: a.deadline,
          created_at: a.created_at,
          submitted: !!a.submission_id,
          submitted_at: a.submitted_at,
          nilai: a.nilai ? parseFloat(a.nilai).toFixed(2) : null,
          status: a.submission_status
        }))
      };
    } catch (error) {
      console.error('Error in getStudentClassStats:', error);
      throw error;
    }
  }
}

module.exports = Assignment;
