const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const Scene = require('../models/Scene');

// Create new scene
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, images, link, isAvailable, featured } = req.body;
    const scene = new Scene({ title, description, images, link, isAvailable, featured });
    await scene.save();
    res.status(201).json(scene);
  } catch (err) {
    res.status(500).json({ message: 'Error creating scene', error: err.message });
  }
});

// Get all scenes
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const scenes = await Scene.find().sort({ createdAt: -1 });
  res.json(scenes);
});

// Update scene
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const updated = await Scene.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete scene
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  await Scene.findByIdAndDelete(req.params.id);
  res.json({ message: 'Scene deleted' });
});

module.exports = router;
