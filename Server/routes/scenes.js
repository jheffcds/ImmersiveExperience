const express = require('express');
const router = express.Router();
const Scene = require('../models/Scene');
const auth = require('../middleware/auth');
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
router.post('/', auth, adminAuth, async (req, res) => {
  const { title, description, isAvailable, link } = req.body;

  if (!title || !link) {
    return res.status(400).json({ message: 'Title and link are required' });
  }

  const newScene = new Scene({
    title,
    description,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    link
  });

  try {
    const savedScene = await newScene.save();
    res.status(201).json(savedScene);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
