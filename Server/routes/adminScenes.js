const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Scene = require('../models/Scene');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const createSceneUploadMiddleware = require('../middleware/uploadSceneImages');

// =================== POST: Create new scene ===================
router.post('/', authenticateToken, adminAuth, async (req, res) => {
  const sceneId = uuidv4();
  const upload = createSceneUploadMiddleware(sceneId);

  upload(req, res, async err => {
    if (err) return res.status(500).json({ message: 'Image upload failed', error: err.message });

    try {
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
        story: req.body.story,
        link: req.body.link,
        bundleName: req.body.bundleName,
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

// =================== GET: All scenes ===================
router.get('/', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scenes = await Scene.find().sort({ createdAt: -1 });
    res.json(scenes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scenes', error: err.message });
  }
});

// =================== GET: Single scene ===================
router.get('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });
    res.json(scene);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scene', error: err.message });
  }
});

// =================== PUT: Update scene ===================
router.put('/:id', authenticateToken, adminAuth, async (req, res) => {
  let scene;
  try {
    scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error finding scene', error: err.message });
  }

  // Check if request is multipart/form-data (i.e., image upload)
  const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data');

  if (!isMultipart) {
    // No image upload — handle JSON-only update
    try {
      const price = req.body.price ? parseFloat(req.body.price) : scene.price;
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price value' });
      }

      const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];
      removedImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', image);
        fs.unlink(imagePath, err => {
          if (err) console.error(`Failed to delete image: ${image}`, err);
        });
      });

      scene.images = scene.images.filter(img => !removedImages.includes(img));
      scene.title = req.body.title || scene.title;
      scene.story = req.body.story || scene.story;
      scene.description = req.body.description || scene.description;
      scene.link = req.body.link || scene.link;
      scene.bundleName = req.body.bundleName || scene.bundleName;
      scene.price = price;
      scene.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
      scene.featured = req.body.featured === 'true' || req.body.featured === true;

      const updatedScene = await scene.save();
      return res.json(updatedScene);
    } catch (err) {
      return res.status(500).json({ message: 'Error updating scene (no files)', error: err.message });
    }
  }

  // If image upload is included, process through multer
  const upload = createSceneUploadMiddleware(scene.sceneId);
  upload(req, res, async err => {
    if (err) {
      return res.status(500).json({ message: 'Image upload failed', error: err.message });
    }

    try {
      const price = req.body.price ? parseFloat(req.body.price) : scene.price;
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price value' });
      }

      const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];
      removedImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', image);
        fs.unlink(imagePath, err => {
          if (err) console.error(`Failed to delete image: ${image}`, err);
        });
      });

      scene.images = scene.images.filter(img => !removedImages.includes(img));
      const newImagePaths = req.files.map(file =>
        path.join('scenes', scene.sceneId, file.filename).replace(/\\/g, '/')
      );

      scene.images = [...scene.images, ...newImagePaths];
      scene.title = req.body.title || scene.title;
      scene.description = req.body.description || scene.description;
      scene.story = req.body.story || scene.story;
      scene.link = req.body.link || scene.link;
      scene.price = price;
      scene.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
      scene.featured = req.body.featured === 'true' || req.body.featured === true;

      const updatedScene = await scene.save();
      res.json(updatedScene);
    } catch (err) {
      res.status(500).json({ message: 'Error updating scene (with files)', error: err.message });
    }
  });
});

// =================== DELETE: Scene ===================
router.delete('/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });

    // Remove image folder
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

module.exports = router;
// =================== DELETE: One image from a scene ===================
router.delete('/:id/images', authenticateToken, adminAuth, async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });

    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'No image specified' });

    // Protect against path traversal attacks
    const normalizedPath = path.normalize(image);
    if (!normalizedPath.startsWith('scenes/')) {
      return res.status(400).json({ message: 'Invalid image path' });
    }

    const imagePath = path.join(__dirname, '..', normalizedPath);
    fs.unlink(imagePath, err => {
      if (err) console.error(`Failed to delete image: ${imagePath}`, err);
    });

    // Remove the image path from the scene's image array
    scene.images = scene.images.filter(img => img !== image);
    await scene.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting image', error: err.message });
  }
});

