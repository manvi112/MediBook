import express from 'express'
import { getMe, login, logout, signupDoctor, signupPatient } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const authRouter = express.Router();

authRouter.post('/signup/patient', signupPatient);
authRouter.post('/signup/doctor',
  upload.fields([
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'registrationCertificate', maxCount: 1 },
  ]),
  signupDoctor
);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', protect, getMe);

export default authRouter;