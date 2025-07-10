import Notification from '../models/Notification.js';
import nodemailer from 'nodemailer';
import { isUserOnline } from '../utils/activeUsers.js';  

import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

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

    if (priority === 'high') {
      const recipient = await User.findById(recipientId).select('email');
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      if (!isUserOnline(recipientId)) {
        // → Simulate sending an email
        console.log(`User is offline, sending email to ${recipient.email}`);
        console.log(`Email simulation: to=${recipient.email}, subject=High Priority Notification, text=${message}`);

        // If you want to actually send it, uncomment:
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient.email,
          subject: 'High Priority Notification',
          text: message
        });
        
      } else {
        console.log(`Recipient ${recipientId} is online — no email needed.`);
      }
    }

    // 4️⃣ Broadcast the new notification
    req.io.emit('notification', notification);

    return res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({ message: 'Error creating notification', error });
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
