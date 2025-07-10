import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import notificationRoutes from './src/routes/notifications.js';
import auth from './src/routes/auth.js';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import Notification from './src/models/Notification.js';
import { activeUsers, addActiveUser, removeActiveUserBySocketId } from './src/utils/activeUsers.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables only once
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);

const io = new socketIo(server, {
  cors: {
    origin: "*", // 💡 For production, change this to your frontend's URL
    methods: ["GET", "POST", 'PUT', 'DELETE', 'PATCH']
  },
});

connectDB();

app.use((req, res, next) => {
  // attach the same io instance to every request
  req.io = io;
  next();
});
app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', auth);

io.on('connection', socket => {
  console.log('⚡️ new socket connected', socket.id);

  socket.on('registerUser', userId => {
    console.log('📥 registerUser received for', userId);
    addActiveUser(userId, socket.id);
    console.log('→ activeUsers now:', activeUsers);
  });

  socket.on('disconnect', () => {
    removeActiveUserBySocketId(socket.id);
    console.log('❌ socket disconnected', socket.id);
  });
});


// Notification cleanup for normal notifications older than 2 days
const deleteNormalNotifications = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    await Notification.deleteMany({
      priority: 'normal',
      createdAt: { $lte: twoDaysAgo },
    });
    console.log('Successfully deleted old normal-priority notifications.');
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};

// Run cleanup job every 24 hours
setInterval(deleteNormalNotifications, 86400000);

// Serve static files from the 'build' folder
app.use(express.static(path.join(__dirname, 'build')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Server listening
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});