require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Define Schema & Model
const ChildSchema = new mongoose.Schema({
  name: String,
  phone: String,
  userId: String,
  password: String,
  registeredAt: { type: Date, default: Date.now },
  emotionHistory: [{
    emotion: String,
    question: String,
    timestamp: { type: Date, default: Date.now }
  }],
  gameReports: [{
    score: Number,
    completedAt: { type: Date, default: Date.now },
    emotions: [String]
  }]
});

const Child = mongoose.model('Child', ChildSchema);

// Register Child (Admin Panel)
app.post('/register', async (req, res) => {
  try {
    console.log('📩 Received Registration Data:', req.body);
    const { name, phone, userId, password } = req.body;
    if (!name || !phone || !userId || !password) {
      console.log('⚠️ Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingChild = await Child.findOne({ phone });
    if (existingChild) {
      return res.status(400).json({ message: '❌ Child already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newChild = new Child({ name, phone, userId, password: hashedPassword });
    await newChild.save();

    console.log('✅ Child registered successfully');
    io.emit('newChild', newChild);
    res.json({ message: '✅ Child registered successfully' });
  } catch (error) {
    console.error('❌ Error in /register:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Authenticate Child (Login)
app.post('/login', async (req, res) => {
  const { name, userId, password } = req.body;
  console.log('📩 Received Login Data:', req.body);

  if (!name || !userId || !password) {
    console.log('⚠️ Missing fields');
    return res.status(400).json({ message: '⚠️ All fields are required' });
  }

  try {
    console.log(`🔍 Searching for: Name = ${name}, User ID = ${userId}`);
    const child = await Child.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      userId: userId.toString(),
    });

    if (!child) {
      console.log('❌ No matching child found!');
      return res.status(401).json({ message: 'Invalid name or user ID' });
    }

    console.log('✅ Found Child:', child);
    const isMatch = await bcrypt.compare(password, child.password);
    console.log('🔑 Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: child.userId, name: child.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Login successful!');
    res.json({ message: '✅ Login successful', token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Save Emotion Data
app.post('/save-emotion', async (req, res) => {
  try {
    const { userId, emotion, question } = req.body;
    if (!userId || !emotion || !question) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const child = await Child.findOne({ userId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    child.emotionHistory.push({ emotion, question });
    await child.save();

    io.emit('emotionUpdate', { userId, emotion, question, timestamp: new Date() });
    res.json({ message: 'Emotion saved successfully' });
  } catch (error) {
    console.error('Error saving emotion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Emotion Trends
app.get('/emotion-trends/:userId', async (req, res) => {
  try {
    const child = await Child.findOne({ userId: req.params.userId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    res.json(child.emotionHistory);
  } catch (error) {
    console.error('Error fetching emotion trends:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Save Game Report
app.post('/save-game-report', async (req, res) => {
  try {
    const { userId, score, emotions } = req.body;
    if (!userId || score === undefined) {
      return res.status(400).json({ message: 'userId and score are required' });
    }

    const child = await Child.findOne({ userId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    child.gameReports.push({ score, emotions });
    await child.save();

    io.emit('gameReportUpdate', { userId, score, emotions, completedAt: new Date() });
    res.json({ message: 'Game report saved successfully' });
  } catch (error) {
    console.error('Error saving game report:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Game Reports
app.get('/game-reports/:userId', async (req, res) => {
  try {
    const child = await Child.findOne({ userId: req.params.userId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    res.json(child.gameReports);
  } catch (error) {
    console.error('Error fetching game reports:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Recently Registered Children
app.get('/children', async (req, res) => {
  try {
    const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
    res.json(children);
  } catch (error) {
    console.error('❌ Error fetching children:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Real-Time Socket.io Connection
io.on('connection', socket => {
  console.log('🟢 Client connected');

  socket.on('fetchChildren', async () => {
    const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
    io.emit('updateChildren', children);
  });

  socket.on('disconnect', () => console.log('🔴 Client disconnected'));
});

// Serve Static Files
app.use(express.static('public'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));