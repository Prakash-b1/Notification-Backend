import express from 'express';
import { managerRole, protect } from '../middlewares/authMiddleware.js';
import { createNotification, getNotifications } from '../controllers/notificationController.js';
import { socketMiddleware } from '../middlewares/socketMiddleware.js';

const router = express.Router();
router.use(socketMiddleware);

router.route('/').get(protect, getNotifications); // Users and Managers can view notifications
router.route('/').post(protect, managerRole, createNotification); // Only Managers can create notifications

export default router;
