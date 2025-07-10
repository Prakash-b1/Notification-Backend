
import Notification from '../models/Notification.js';
import nodemailer from 'nodemailer';
import { isUserOnline, activeUsers, getInactiveUserIds } from '../utils/activeUsers.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const createNotification = async (req, res) => {
  try {
    const { message, priority, recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    const notification = new Notification({
      message,
      priority,
      recipient: recipientId
    });
    await notification.save();

    const socketId = activeUsers[recipientId];

    console.log('Active users map:', activeUsers);
    console.log('Looking for recipientId:', recipientId, '→ socketId:', socketId);

    console.log('Broadcasting notification to everyone');
    req.io.emit('notification', notification);


    const inactiveIds = await getInactiveUserIds();
    console.log('Currently offline user IDs:', inactiveIds);


    for (const userId of inactiveIds) {
      const user = await User.findById(userId).select('email');
      if (!user?.email) continue;

      // Choose subject/body based on priority
      const subject = priority === 'high'
        ? 'High Priority Notification'
        : 'You have a new notification';
      const text = priority === 'high'
        ? message
        : `Hi there, you received a new notification: "${message}"`;

      console.log(`Emailing ${priority}-priority notification to offline user ${user.email}`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        text
      });
    }

    return res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};


export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error });
  }
};
