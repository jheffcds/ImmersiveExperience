const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Scene = require('../models/Scene');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createSceneUploadMiddleware = require('../middleware/uploadSceneImages');

// Create new scene with images
router.post('/', authenticateToken, adminAuth, async (req, res) => {
  const sceneId = uuidv4();
  const upload = createSceneUploadMiddleware(sceneId);

  upload(req, res, async err => {
    if (err) return res.status(500).json({ message: 'Image upload failed', error: err.message });

    try {
      // Validate price (parse from req.body.price)
      const price = parseFloat(req.body.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price value' });
      }

      const imagePaths = req.files.map(file =>
        path.join('scenes', sceneId, file.filename).replace(/\\/g, '/')
      );

      const isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
      const featured = req.body.featured === 'true' || req.body.featured === true;

      const scene = new Scene({
        sceneId,
        title: req.body.title,
        description: req.body.description,
        link: req.body.link,
        price,
        isAvailable,
        featured,
        images: imagePaths
      });

      await scene.save();
      res.status(201).json(scene);
    } catch (err) {
      res.status(500).json({ message: 'Error saving scene', error: err.message });
    }
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
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });

    // Delete folder with images
    const sceneFolder = path.join(__dirname, '..', 'scenes', scene.sceneId);
    fs.rm(sceneFolder, { recursive: true, force: true }, (err) => {
      if (err) console.error('Failed to delete scene folder:', err);
    });

    await Scene.findByIdAndDelete(req.params.id);
    res.json({ message: 'Scene deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting scene', error: err.message });
  }
});
router.get('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });
    res.json(scene);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scene', error: err.message });
  }
});

module.exports = router;
