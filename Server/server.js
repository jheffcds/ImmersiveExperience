require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const protectedRoutes = require('./routes/protected');
const authRoutes = require('./routes/auth');
const sceneRoutes = require('./routes/scenes');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/scenes', sceneRoutes);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, '0.0.0.0', () => console.log("Server running on port 5000"));
  })
  .catch(err => console.error(err));

