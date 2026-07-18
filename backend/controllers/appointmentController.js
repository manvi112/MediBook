import appointmentModel from "../models/appointment.js";
import doctorProfileModel from '../models/doctorProfile.js';
import { availableSlotsCheck } from '../utils/availableSlotsCheck.js';

import notificationModel from '../models/notification.js';
import userModel from '../models/user.js';
import sendEmail from '../utils/sendEmail.js';
import {
  appointmentBookedDoctor,
  appointmentConfirmedPatient,
  appointmentCancelledPatient,
  appointmentCancelledDoctor,
  appointmentCompletedPatient,
} from '../utils/emailTemplates.js';

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

    const patient = await userModel.findById(req.session.userId);
    const doctorUser = await userModel.findById(doctorId);

    await notificationModel.create({
      user: doctorId,
      message: `New appointment request from ${patient.name} on ${date} at ${startTime}`,
      type: 'appointment_booked',
    });

    const template = appointmentBookedDoctor(patient.name, date, startTime);
    await sendEmail({ to: doctorUser.email, ...template });

    res.status(201).json({ success: true, appointment });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This slot was just booked by someone else' });
    }
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

    const patient = await userModel.findById(appointment.patient);
    const doctor = await userModel.findById(appointment.doctor);
    const dateStr = appointment.date.toDateString();


    if (status === 'confirmed') {
      await notificationModel.create({
        user: appointment.patient,
        message: `Your appointment with Dr. ${doctor.name} has been confirmed`,
        type: 'appointment_confirmed',
      });
      const template = appointmentConfirmedPatient(doctor.name, dateStr, appointment.startTime);
      await sendEmail({ to: patient.email, ...template });

    } else if (status === 'cancelled' && role === 'doctor') {
      await notificationModel.create({
        user: appointment.patient,
        message: `Your appointment with Dr. ${doctor.name} has been cancelled`,
        type: 'appointment_cancelled',
      });
      const template = appointmentCancelledPatient(doctor.name, dateStr, appointment.startTime);
      await sendEmail({ to: patient.email, ...template });

    } else if (status === 'cancelled' && role === 'patient') {
      await notificationModel.create({
        user: appointment.doctor,
        message: `${patient.name} has cancelled their appointment on ${dateStr}`,
        type: 'appointment_cancelled',
      });
      const template = appointmentCancelledDoctor(patient.name, dateStr, appointment.startTime);
      await sendEmail({ to: doctor.email, ...template });

    } else if (status === 'completed') {
      await notificationModel.create({
        user: appointment.patient,
        message: `Your appointment with Dr. ${doctor.name} has been completed`,
        type: 'appointment_reminder',
      });
      const template = appointmentCompletedPatient(doctor.name);
      await sendEmail({ to: patient.email, ...template });
    }

    res.status(200).json({ success: true, appointment });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};