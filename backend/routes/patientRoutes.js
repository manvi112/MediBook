import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';

const patientRouter = express.Router();

patientRouter.get('/profile', protect, authorize('patient'), getPatientProfile);
patientRouter.patch('/profile', protect, authorize('patient'), updatePatientProfile);

export default patientRouter;