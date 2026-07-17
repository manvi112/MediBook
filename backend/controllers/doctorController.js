import doctorProfileModel from '../models/doctorProfile.js';
import appointmentModel from '../models/appointment.js';
import { availableSlotsCheck } from '../utils/availableSlotsCheck.js';
import userModel from '../models/user.js';


export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorProfileModel.find({ isApproved: true }).populate('user', '-password');
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorProfileModel.findById(req.params.id).populate('user', '-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    if (req.body.phone) {
      await userModel.findByIdAndUpdate(
        req.session.userId,
        { $set: { phone: req.body.phone } },
        { runValidators: true }
      );
    }

    const allowedFields = [
      'specialization',
      'qualification',
      'experienceYears',
      'consultationFee',
      'bio',
      'city',
      'clinicAddress',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0 && !req.body.phone) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const profile = await doctorProfileModel.findOneAndUpdate(
      { user: req.session.userId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', '-password');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { weeklyAvailability } = req.body;

    if (!weeklyAvailability || !Array.isArray(weeklyAvailability)) {
      return res.status(400).json({ success: false, message: 'weeklyAvailability must be an array' });
    }

    const doctor = await doctorProfileModel.findOneAndUpdate(
      { user: req.session.userId },
      { $set: { weeklyAvailability } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = await doctorProfileModel.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }


    const availableSlots = await availableSlotsCheck(doctor, date);

    res.status(200).json({ success: true, availableSlots });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const profile = await doctorProfileModel
      .findOne({ user: req.session.userId })
      .populate('user', '-password');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};