import appointmentModel from "../models/appointment.js";
import doctorProfileModel from '../models/doctorProfile.js';
import { availableSlotsCheck } from '../utils/availableSlotsCheck.js';

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, startTime, reason } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const doctor = await doctorProfileModel.findOne({ user: doctorId });
    if (!doctor || !doctor.isApproved) {
      return res.status(404).json({ success: false, message: 'Doctor not found or not approved' });
    }

    const availableSlots = await availableSlotsCheck(doctor, date);

    if (!availableSlots.includes(startTime)) {
      return res.status(400).json({ success: false, message: 'This slot is not available' });
    }

    // calculating endTime automatically
    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = doctor.weeklyAvailability.find(d => d.day === dayName);

    const [startHour, startMin] = startTime.split(':').map(Number);
    const endTotal = startHour * 60 + startMin + daySchedule.slotDurationMinutes;
    const endHour = Math.floor(endTotal / 60).toString().padStart(2, '0');
    const endMin = (endTotal % 60).toString().padStart(2, '0');
    const endTime = `${endHour}:${endMin}`;

    const appointment = await appointmentModel.create({
      patient: req.session.userId,
      doctor: doctorId,
      date: new Date(date),
      startTime,
      endTime,
      reason,
    });

    res.status(201).json({ success: true, appointment });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const filter = { patient: req.session.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await appointmentModel.find(filter)
      .populate('patient', '-password')
      .populate('doctor', '-password');

    res.status(200).json({ success: true, appointments });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const filter = { doctor: req.session.userId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await appointmentModel.find(filter)
      .populate('patient', '-password')
      .populate('doctor', '-password');

    res.status(200).json({ success: true, appointments });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const role = req.session.role;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot update this appointment' });
    }

    if (role === 'patient' && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
    }

    const doctorAllowedStatuses = ['confirmed', 'cancelled', 'completed'];
    if (role === 'doctor' && !doctorAllowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, appointment });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};