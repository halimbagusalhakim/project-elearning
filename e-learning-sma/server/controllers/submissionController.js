const Submission = require('../models/Submission');

const getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await Submission.findByAssignmentId(req.params.assignmentId);
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createSubmission = async (req, res) => {
  let assignment_id = req.body.assignment_id;
  let komentar = req.body.komentar;
  let file_path = null;
  let file_type = null;

  if (typeof komentar === 'undefined' || komentar === '') {
    komentar = null;
  }
  if (typeof assignment_id === 'undefined' || assignment_id === '') {
    assignment_id = null;
  }

  // Handle file upload
  if (req.files && req.files.length > 0) {
    const file = req.files[0]; // Get the first file (should be the assignment file)
    file_path = '/uploads/' + file.filename;
    file_type = file.mimetype;
  }

  try {
    // Check if submission already exists for this assignment and student
    const existingSubmissions = await Submission.findByAssignmentId(assignment_id);
    const existingSubmission = existingSubmissions.find(sub => sub.siswa_id === req.user.id);

    if (existingSubmission) {
      // Update existing submission instead of creating new to avoid duplicate key error
      await Submission.update(existingSubmission.id, {
        file_path,
        file_type,
        komentar,
        status: 'submitted'
      });
      return res.status(200).json({ id: existingSubmission.id, message: 'Submission updated successfully' });
    }

    const submissionId = await Submission.create({
      assignment_id: parseInt(assignment_id),
      siswa_id: req.user.id,
      file_path,
      file_type,
      komentar,
      status: 'submitted'
    });

    res.status(201).json({ id: submissionId, message: 'Submission created successfully' });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateSubmission = async (req, res) => {
  const { komentar, nilai, status } = req.body;
  let file_path = null;
  let file_type = null;

  if (req.file) {
    file_path = '/uploads/' + req.file.filename;
    file_type = req.file.mimetype;
  }

  try {
    const existingSubmission = await Submission.findById(req.params.id);
    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user is the student who submitted or a teacher
    if (existingSubmission.siswa_id !== req.user.id && req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this submission' });
    }

    const updateData = {};
    if (file_path !== null) updateData.file_path = file_path;
    if (file_type !== null) updateData.file_type = file_type;
    if (komentar !== undefined) updateData.komentar = komentar;
    if (nilai !== undefined) updateData.nilai = nilai;
    if (status !== undefined) updateData.status = status;

    // Set graded_at timestamp if grading
    if (nilai !== undefined || status === 'graded') {
      updateData.graded_at = new Date();
    }

    const affectedRows = await Submission.update(req.params.id, updateData);

    res.json({ message: 'Submission updated successfully', affectedRows });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const gradeSubmission = async (req, res) => {
  const { nilai, komentar } = req.body;

  try {
    const existingSubmission = await Submission.findById(req.params.id);
    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Only teachers and admins can grade
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to grade submissions' });
    }

    const updateData = {
      nilai,
      komentar,
      status: 'graded',
      graded_at: new Date()
    };

    const affectedRows = await Submission.update(req.params.id, updateData);

    res.json({ message: 'Submission graded successfully', affectedRows });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const existingSubmission = await Submission.findById(req.params.id);
    if (!existingSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user is the student who submitted or a teacher
    if (existingSubmission.siswa_id !== req.user.id && req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this submission' });
    }

    const affectedRows = await Submission.delete(req.params.id);
    res.json({ message: 'Submission deleted successfully', affectedRows });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getSubmissionsByAssignment,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission
};
