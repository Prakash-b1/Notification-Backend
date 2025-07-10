import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import notificationRoutes from './src/routes/notifications.js';
import auth from './src/routes/auth.js';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import Notification from './src/models/Notification.js';
import { activeUsers, addActiveUser, removeActiveUser } from './src/utils/activeUsers.js'; // Ensure activeUsers is correctly managed
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

const io = new socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", 'PUT', 'DELETE', 'PATCH']
  },
});

connectDB();

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', auth);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register user when the 'register' event is received
  socket.on('register', (userId) => {
    console.log(`Registering user with ID: ${userId}`);
    addActiveUser(socket.id, userId); // Associate socket.id with userId
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle socket disconnection
  socket.on('disconnect', () => {
    const userId = activeUsers[socket.id];
    if (userId) {
      removeActiveUser(socket.id);  // Remove user from active users on disconnect
      console.log(`User ${userId} disconnected`);
    }
  });
});

// Notification cleanup for normal notifications older than 2 days
const deleteNormalNotifications = async () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await Notification.deleteMany({
    priority: 'normal',
    createdAt: { $lte: twoDaysAgo },
  });
};

setInterval(deleteNormalNotifications, 86400000);

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));



// Server listening
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
