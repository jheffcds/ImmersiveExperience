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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/scenes', sceneRoutes);

// Serve static frontend files from the Client directory
try {
  app.use(express.static(path.join(__dirname, '../Client')));
  console.log('✔ Static client files registered');
} catch (err) {
  console.error('Failed to register static client files:', err.message);
}


// Fallback to index.html for any other route (good for SPAs)
app.get('/*splat', (req, res) => {
  console.log('here server');
  res.sendFile(path.join(__dirname, '../Client', 'index.html'));
});

app.get('/api/config/google', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
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
