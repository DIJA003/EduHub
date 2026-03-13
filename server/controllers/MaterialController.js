const Material = require('../models/Material');


// GET ALL MATERIALS
exports.getAll = async (req, res) => {
  try {

    const materials = await Material.find()
      .populate('courseRef')
      .populate('uploaderId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: materials });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET MATERIAL BY ID
exports.getById = async (req, res) => {
  try {

    const material = await Material.findById(req.params.id)
      .populate('courseRef')
      .populate('uploaderId', 'name email');

    if (!material)
      return res.status(404).json({ success: false, message: 'Material not found' });

    res.json({ success: true, data: material });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// CREATE MATERIAL (WITH FILE UPLOAD)
exports.create = async (req, res) => {
  try {

    const materialData = {
      title: req.body.title,
      type: req.body.type,
      course: req.body.course,
      size: req.body.size,
      courseRef: req.body.courseRef,
      uploaderId: req.user?.id, // student uploading
      uploader: req.user?.name,
      status: 'pending'
    };

    // if file uploaded
    if (req.file) {
      materialData.fileUrl = req.file.path;
    }

    const material = await Material.create(materialData);

    res.status(201).json({
      success: true,
      data: material
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// UPDATE MATERIAL
exports.update = async (req, res) => {
  try {

    const updateData = { ...req.body };

    if (req.file) {
      updateData.fileUrl = req.file.path;
    }

    const material = await Material.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!material)
      return res.status(404).json({ success: false, message: 'Material not found' });

    res.json({ success: true, data: material });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// DELETE MATERIAL
exports.remove = async (req, res) => {
  try {

    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material)
      return res.status(404).json({ success: false, message: 'Material not found' });

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};