import patientProfileModel from '../models/patientProfile.js';
import userModel from '../models/user.js';

export const getPatientProfile = async (req, res) => {
  try {
    const profile = await patientProfileModel
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

export const updatePatientProfile = async (req, res) => {
  try {

    if (req.body.phone) {
      await userModel.findByIdAndUpdate(
        req.session.userId,
        { $set: { phone: req.body.phone } },
        { runValidators: true }
      );
    }

    const allowedFields = ['age', 'bloodGroup', 'allergies', 'existingConditions', 'emergencyContact'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0 && !req.body.phone) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const profile = await patientProfileModel.findOneAndUpdate(
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