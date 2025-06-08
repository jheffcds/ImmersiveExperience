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
  // First, find the existing scene by ID
  let scene;
  try {
    scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error finding scene', error: err.message });
  }

  const upload = createSceneUploadMiddleware(scene.sceneId);

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Image upload failed', error: err.message });
    }

    try {
      // Convert price safely
      const price = req.body.price ? parseFloat(req.body.price) : scene.price;
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price value' });
      }

      // Get array of images to remove (if any)
      const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

      // Remove deleted images from file system and from scene.images
      removedImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', image);
        fs.unlink(imagePath, (err) => {
          if (err) console.error(`Failed to delete image: ${image}`, err);
        });
      });

      scene.images = scene.images.filter(img => !removedImages.includes(img));

      // Add newly uploaded files
      const newImagePaths = req.files.map(file =>
        path.join('scenes', scene.sceneId, file.filename).replace(/\\/g, '/')
      );

      // Update scene fields
      scene.title = req.body.title || scene.title;
      scene.description = req.body.description || scene.description;
      scene.link = req.body.link || scene.link;
      scene.price = price;
      scene.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
      scene.featured = req.body.featured === 'true' || req.body.featured === true;
      scene.images = [...scene.images, ...newImagePaths];

      const updatedScene = await scene.save();
      res.json(updatedScene);
    } catch (err) {
      res.status(500).json({ message: 'Error updating scene', error: err.message });
    }
  });
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
