const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Scene = require('../models/Scene');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic Multer middleware for scene-specific folder
function createSceneUploadMiddleware(sceneId) {
  const scenePath = path.join(__dirname, '..', 'scenes', sceneId);
  if (!fs.existsSync(scenePath)) {
    fs.mkdirSync(scenePath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, scenePath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });

  return multer({ storage }).array('images', 10);
}

// Create new scene with images
router.post('/', authenticateToken, adminAuth, async (req, res) => {
  const sceneId = uuidv4();
  const tempMulter = multer().none(); // Parse non-file fields first

  tempMulter(req, res, async err => {
    if (err) return res.status(500).json({ message: 'Form parsing failed', error: err.message });

    const upload = createSceneUploadMiddleware(sceneId);
    upload(req, res, async err => {
      if (err) return res.status(500).json({ message: 'Image upload failed', error: err.message });

      try {
        const imagePaths = req.files.map(file =>
          path.join('scenes', sceneId, file.filename).replace(/\\/g, '/')
        );

        const scene = new Scene({
          sceneId,
          title: req.body.title,
          description: req.body.description,
          link: req.body.link,
          price: parseFloat(req.body.price) || 0,
          isAvailable: req.body.isAvailable === 'true',
          featured: req.body.featured === 'true',
          images: imagePaths
        });

        await scene.save();
        res.status(201).json(scene);
      } catch (err) {
        res.status(500).json({ message: 'Error saving scene', error: err.message });
      }
    });
  });
});

// Get all scenes
router.get('/', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scenes = await Scene.find().sort({ createdAt: -1 });
    res.json(scenes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scenes', error: err.message });
  }
});

// Update scene
router.put('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const updatedData = {
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : 0
    };

    const updated = await Scene.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating scene', error: err.message });
  }
});

// Delete scene
router.delete('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    await Scene.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scene deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting scene', error: err.message });
  }
});

module.exports = router;
