const Material = require('../models/Material');

exports.getAll = async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    let fileUrl = '';
    let fileSize = '';
    let fileType = req.body.type || 'File';

    if (req.file) {
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      fileType = req.file.mimetype;
    }

    const isAdminRoute = req.baseUrl.includes('admin');
    
    const materialData = {
      ...req.body,
      fileUrl: fileUrl || req.body.fileUrl,
      size: fileSize,
      type: fileType,
      status: isAdminRoute ? 'Active' : 'Pending',
    };

    const material = await Material.create(materialData);
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { status: 'Active' },
      { new: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, message: 'Material approved successfully', data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};