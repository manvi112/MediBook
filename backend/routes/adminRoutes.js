import express from 'express';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';
import { getPendingDoctors, approveDoctor, rejectDoctor, getAllUsers, deleteUser, getAllAppointments } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/doctors/pending', protect, authorize('admin'), getPendingDoctors);
adminRouter.put('/doctors/:id/approve', protect, authorize('admin'), approveDoctor);
adminRouter.put('/doctors/:id/reject', protect, authorize('admin'), rejectDoctor);
adminRouter.get('/users', protect, authorize('admin'), getAllUsers);
adminRouter.delete('/users/:id', protect, authorize('admin'), deleteUser);
adminRouter.get('/appointments', protect, authorize('admin'), getAllAppointments);

export default adminRouter;