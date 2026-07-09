import doctorProfileModel from '../models/doctorProfile.js';
import appointmentModel from '../models/appointment.js';


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

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const doctor = await doctorProfileModel.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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

export const updateAvailability = async (req, res) => {
  try {
    const { weeklyAvailability } = req.body;

    if (!weeklyAvailability || !Array.isArray(weeklyAvailability)) {
      return res.status(400).json({ success: false, message: 'weeklyAvailability must be an array' });
    }

    const doctor = await doctorProfileModel.findByIdAndUpdate(
      req.params.id,
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


    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });


    const daySchedule = doctor.weeklyAvailability.find(d => d.day === dayName);
    if (!daySchedule) {
      return res.status(200).json({ success: true, availableSlots: [] });
    }


    const allSlots = [];
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);

    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    for (let time = startTotal; time < endTotal; time += daySchedule.slotDurationMinutes) {
      const hours = Math.floor(time / 60).toString().padStart(2, '0');
      const mins = (time % 60).toString().padStart(2, '0');
      allSlots.push(`${hours}:${mins}`);
    }

    // fetching already booked slots for that doctor on that date
    const bookedAppointments = await appointmentModel.find({
      doctor: doctor.user,
      date: selectedDate,
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedSlots = bookedAppointments.map(a => a.startTime);

    // removing booked slots from all slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ success: true, availableSlots });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};