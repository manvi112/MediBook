import express from 'express';
import protect from '../middleware/auth.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';

const notificationRouter = express.Router();

notificationRouter.get('/', protect, getNotifications);
notificationRouter.patch('/:id/read', protect, markAsRead);

export default notificationRouter;