const express = require('express');
const router = express.Router();
const Scene = require('../models/Scene');

// Middleware placeholder for admin auth - to implement later
const adminAuth = (req, res, next) => {
  // You can replace this with real admin verification logic
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

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
router.post('/', adminAuth, async (req, res) => {
    console.log('here routes/scenes');
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
