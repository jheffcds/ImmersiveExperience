const express = require('express');
const router = express.Router();
const Scene = require('../models/Scene');
const authenticateToken = require('../middleware/auth');

const adminAuth = require('../middleware/adminAuth');

// GET all scenes
router.get('/', async (req, res) => {
  try {
    const scenes = await Scene.find();
    res.json(scenes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET scene by ID
router.get('/:id', async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene) return res.status(404).json({ message: 'Scene not found' });
    res.json(scene);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new scene (admin only)
router.post('/', authenticateToken, adminAuth, (req, res) => {
  const sceneId = uuidv4();
  const upload = createSceneUploadMiddleware(sceneId);

  upload(req, res, async err => {
    if (err) {
      return res.status(500).json({ message: 'Image upload failed', error: err.message });
    }

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


module.exports = router;
