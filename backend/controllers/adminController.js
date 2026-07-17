import doctorProfileModel from '../models/doctorProfile.js';
import userModel from '../models/user.js';
import appointmentModel from '../models/appointment.js';

export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await doctorProfileModel
      .find({ isApproved: false })
      .populate('user', '-password');

    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const approveDoctor = async (req, res) => {
  try {
    const doctor = await doctorProfileModel.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true } },
      { returnDocument: 'after' }
    ).populate('user', '-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const doctor = await doctorProfileModel.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await userModel.findByIdAndDelete(doctor.user);

    res.status(200).json({ success: true, message: 'Doctor rejected successfully' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find()
      .populate('patient', '-password')
      .populate('doctor', '-password');

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};