import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';
import { getAllDoctors, getAvailableSlots, getDoctorById, updateAvailability, updateDoctorProfile, getDoctorProfile } from '../controllers/doctorController.js';

const doctorRouter = express.Router();

doctorRouter.get('/profile', protect, authorize('doctor'), getDoctorProfile);
doctorRouter.patch('/profile', protect, authorize('doctor'), updateDoctorProfile);
doctorRouter.patch('/profile/availability', protect, authorize('doctor'), updateAvailability); // ← move this up
doctorRouter.get('/', getAllDoctors);
doctorRouter.get('/:id', getDoctorById);
doctorRouter.get('/:id/slots', getAvailableSlots);

export default doctorRouter;