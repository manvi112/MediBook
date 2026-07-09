import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';
import { getAllDoctors, getAvailableSlots, getDoctorById, updateAvailability, updateDoctorProfile } from '../controllers/doctorController.js';

const doctorRouter = express.Router();

doctorRouter.get('/', getAllDoctors);
doctorRouter.get('/:id', getDoctorById);
doctorRouter.patch('/:id', protect, authorize('doctor'), updateDoctorProfile);
doctorRouter.patch('/:id/availability', protect, authorize('doctor'), updateAvailability);
doctorRouter.get('/:id/slots', getAvailableSlots);

export default doctorRouter;