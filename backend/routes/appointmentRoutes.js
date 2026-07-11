import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';
import { bookAppointment, getPatientAppointments, getDoctorAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

appointmentRouter.post('/', protect, authorize('patient'), bookAppointment);
appointmentRouter.get('/patient', protect, authorize('patient'), getPatientAppointments);
appointmentRouter.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
appointmentRouter.patch('/:id/status', protect, authorize('patient', 'doctor'), updateAppointmentStatus);

export default appointmentRouter;