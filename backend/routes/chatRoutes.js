import express from 'express';
import protect from '../middleware/auth.js';
import { chat } from '../controllers/chatController.js';

const chatRouter = express.Router();

chatRouter.post('/', protect, chat);

export default chatRouter;