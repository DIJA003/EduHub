const Material = require('../models/Material');
const { bucket } = require('../config/firebase_admin'); 

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
    const file = req.file; 
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileName = `materials/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype }
    });

    blobStream.on('error', (error) => {
      console.error('Firebase Upload Error:', error);
      return res.status(500).json({ success: false, message: 'Error uploading file to Firebase' });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

      const material = await Material.create({
        ...req.body,
        fileUrl: publicUrl, 
        fileType: file.mimetype, 
        status: 'Pending', 
        uploaded: new Date().toISOString().split('T')[0],
      });

      res.status(201).json({ success: true, data: material });
    });

    blobStream.end(file.buffer);

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