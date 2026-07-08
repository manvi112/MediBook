import express from 'express'
import { getMe, login, logout, signupDoctor, signupPatient } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/signup/patient', signupPatient);
authRouter.post('/signup/doctor', signupDoctor);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', protect, getMe);

export default authRouter;