import appointmentModel from "../models/appointment.js";
import doctorProfileModel from "../models/doctorProfile.js";
import { availableSlotsCheck } from "./availableSlotsCheck.js";

export const patientTools = [
  {
    type: 'function',
    function: {
      name: 'find_doctors',
      description: 'Find approved doctors by specialization and/or city',
      parameters: {
        type: 'object',
        properties: {
          specialization: {
            type: 'string',
            description: 'Medical specialization e.g. Cardiology, Dermatology',
          },
          city: {
            type: 'string',
            description: 'City where the patient wants to find a doctor',
          },
        },
        required: [],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check available appointment slots for a specific doctor on a specific date',
      parameters: {
        type: 'object',
        properties: {
          doctorId: {
            type: 'string',
            description: 'The user ID of the doctor',
          },
          date: {
            type: 'string',
            description: 'Date in YYYY-MM-DD format',
          },
        },
        required: ['doctorId', 'date'],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'get_my_appointments',
      description: 'Get appointments for the logged in patient, optionally filtered by status',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            description: 'Filter appointments by status',
          },
        },
        required: [],
      },
    },
  },
]


export const doctorTools = [
  {
    type: 'function',
    function: {
      name: 'get_doctor_appointments',
      description: 'Get appointments for the logged in doctor, optionally filtered by status',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            description: 'Filter appointments by status',
          },
        },
        required: [],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'update_appointment_status',
      description: 'Confirm, cancel or complete an appointment',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description: 'The ID of the appointment to update',
          },
          status: {
            type: 'string',
            enum: ['confirmed', 'cancelled', 'completed'],
            description: 'New status for the appointment',
          },
        },
        required: ['appointmentId', 'status'],
      },
    },
  },
]


export const executePatientTool = async (toolName, args, userId) => {
  if (toolName === 'find_doctors') {
    const filter = { isApproved: true };
    if (args.specialization) filter.specialization = new RegExp(args.specialization.replace(/y$/, ''), 'i');
    if (args.city) filter.city = new RegExp(args.city, 'i');

    const doctors = await doctorProfileModel.find(filter).populate('user', '-password');

    if (doctors.length === 0) {
      return 'No doctors found matching your criteria.';
    }

    return doctors.map(d => ({
      doctorId: d.user._id,
      name: d.user.name,
      specialization: d.specialization,
      city: d.city,
      consultationFee: d.consultationFee,
      experienceYears: d.experienceYears,
    }));
  }

  if (toolName === 'check_availability') {
    const doctor = await doctorProfileModel.findOne({ user: args.doctorId, isApproved: true });
    if (!doctor) return 'Doctor not found.';

    const slots = await availableSlotsCheck(doctor, args.date);
    if (slots.length === 0) return `No available slots for this doctor on ${args.date}.`;

    return { date: args.date, availableSlots: slots };
  }

  if (toolName === 'get_my_appointments') {
    const filter = { patient: userId };
    if (args.status) filter.status = args.status;

    const appointments = await appointmentModel.find(filter)
      .populate('doctor', '-password')
      .sort({ date: 1 });

    if (appointments.length === 0) return 'No appointments found.';
    return appointments;
  }
}


export const executeDoctorTool = async (toolName, args, userId) => {
  if (toolName === 'get_doctor_appointments') {
    const filter = { doctor: userId };
    if (args.status) filter.status = args.status;

    const appointments = await appointmentModel.find(filter)
      .populate('patient', '-password')
      .sort({ date: 1 });

    if (appointments.length === 0) return 'No appointments found.';
    return appointments;
  }

  if (toolName === 'update_appointment_status') {
    const appointment = await appointmentModel.findById(args.appointmentId);
    if (!appointment) return 'Appointment not found.';

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return 'This appointment cannot be updated.';
    }

    appointment.status = args.status;
    await appointment.save();
    return `Appointment status updated to ${args.status} successfully.`;
  }
};