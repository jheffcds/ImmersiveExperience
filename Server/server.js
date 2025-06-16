require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');


app.use(cors());
app.use(express.json());

// Routes
const protectedRoutes = require('./routes/protected');
const authRoutes = require('./routes/auth');
const sceneRoutes = require('./routes/scenes');
const configRoutes = require('./routes/config');
const userRoutes = require('./routes/users');
const purchaseRoutes = require('./routes/purchase');
const adminSceneRoutes = require('./routes/adminScenes');
const favouriteRoutes = require('./routes/favourites');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook'); // ✅ FIXED

// API route mounting
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard_cat', // change this in .env
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  }
}));
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/scenes', sceneRoutes);
app.use('/api/config', configRoutes);
app.use('/api/user', userRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/admin/scenes', adminSceneRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api', checkoutRoutes);
app.use('/api/webhook', webhookRoutes); // ✅ FIXED POSITION & REFERENCE

// Static assets
try {
  app.use('/scenes', express.static(path.join(__dirname, 'scenes')));
  console.log('✔ access to scene folder granted');
} catch (err) {
  console.error('access to scene folder denied:', err.message);
}

try {
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // ✅ Unified
  console.log('✔ access to uploads folder granted');
} catch (err) {
  console.error('access to upload folder denied:', err.message);
}

try {
  app.use(express.static(path.join(__dirname, '../Client')));
  console.log('✔ Static client files registered');
} catch (err) {
  console.error('access to client folder denied:', err.message);
}

// Serve dashboard and fallback to SPA
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client', 'dashboard.html'));
});

app.get('/*splat', (req, res) => {
  console.log('Fallback route hit');
  res.sendFile(path.join(__dirname, '../Client', 'index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, '0.0.0.0', () => console.log("🚀 Server running on port 5000"));
  })
  .catch(err => console.error('MongoDB connection error:', err));
