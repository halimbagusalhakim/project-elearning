const Material = require('../models/Material');

const getMaterialsByClass = async (req, res) => {
  try {
    const materials = await Material.getByClassId(req.params.classId);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createMaterial = async (req, res) => {
  const { kelas_id, judul, deskripsi, created_by } = req.body;

  if (!kelas_id || isNaN(parseInt(kelas_id))) {
    return res.status(400).json({ error: 'Invalid or missing kelas_id' });
  }

  let file_path = null;
  let file_type = null;

  if (req.file) {
    file_path = '/uploads/' + req.file.filename;
    file_type = req.file.mimetype;
  }

  // For admin, allow specifying created_by, otherwise use logged-in user
  const creatorId = (req.user.role === 'admin' && created_by) ? created_by : req.user.id;

  try {
    const materialId = await Material.create({
      kelas_id,
      judul,
      deskripsi,
      file_path,
      file_type,
      created_by: creatorId
    });

    res.status(201).json({ id: materialId, message: 'Material created successfully' });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMaterial = async (req, res) => {
  let { judul, deskripsi, file_path, file_type } = req.body;

  if (req.file) {
    file_path = '/uploads/' + req.file.filename;
    file_type = req.file.mimetype;
  }

  // Sanitize undefined values to null to avoid SQL bind error
  judul = judul === undefined ? null : judul;
  deskripsi = deskripsi === undefined ? null : deskripsi;
  file_path = file_path === undefined ? null : file_path;
  file_type = file_type === undefined ? null : file_type;

  try {
    const existingMaterial = await Material.findById(req.params.id);
    if (!existingMaterial) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (existingMaterial.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this material' });
    }

    const affectedRows = await Material.update(req.params.id, {
      judul,
      deskripsi,
      file_path,
      file_type
    });

    res.json({ message: 'Material updated successfully', affectedRows });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const existingMaterial = await Material.findById(req.params.id);
    if (!existingMaterial) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (existingMaterial.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this material' });
    }

    const affectedRows = await Material.delete(req.params.id);
    res.json({ message: 'Material deleted successfully', affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getRecentMaterials = async (req, res) => {
    try {
      console.log('Fetching recent materials');
      const materials = await Material.getRecentMaterials(10);
      console.log('Recent materials fetched successfully:', materials.length, 'materials found');
      res.json(materials);
    } catch (error) {
      console.error('Error fetching recent materials:', error);
      console.error(error.stack);
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  };

const getStudentMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;
    const materials = await Material.getStudentMaterials(studentId);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching student materials:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching all materials:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMaterialsByClass,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getRecentMaterials,
  getStudentMaterials,
  getAllMaterials
};
