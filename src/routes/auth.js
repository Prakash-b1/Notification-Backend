import express from 'express';
import { signup, login, getUser } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/user', protect, getUser); 
router.post('/signup',signup);
router.post('/login', login);


export default router;