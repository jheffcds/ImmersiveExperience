require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const protectedRoutes = require('./routes/protected');
const authRoutes = require('./routes/auth');
const sceneRoutes = require('./routes/scenes');
const configRoutes = require('./routes/config');
const userRoutes = require('./routes/users');
const purchaseRoutes = require('./routes/purchase');
const adminSceneRoutes = require('./routes/adminScenes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/config', configRoutes);
app.use('/uploads', express.static('public/uploads'));
app.use('/api/user', userRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin/scenes', adminSceneRoutes);
// Serve static scene images
try {
  app.use('/scenes', express.static(path.join(__dirname, 'scenes')));
  console.log('✔ access to scene folder granted');
} catch (err) {
  console.error('access to scene folder denied:', err.message);
}

// Serve static frontend files from the Client directory
try {
  app.use(express.static(path.join(__dirname, '../Client')));
  console.log('✔ Static client files registered');
} catch (err) {
  console.error('access to upload folder denied:', err.message);
}
// Serve uploads folder statically
try {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log('✔ access to uploads folder granted');
} catch (err) {
  console.error('access to upload folder denied', err.message);
}
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client', 'dashboard.html'));
});app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client', 'dashboard.html'));
});

// Fallback to index.html for any other route (good for SPAs)
app.get('/*splat', (req, res) => {
  console.log('here server');
  res.sendFile(path.join(__dirname, '../Client', 'index.html'));
});


// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, '0.0.0.0', () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));
