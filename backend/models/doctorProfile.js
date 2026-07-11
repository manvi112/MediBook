import mongoose from "mongoose";

// Subdocument 
const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, default: 30 },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true },
    qualification: { type: String },
    experienceYears: { type: Number },
    consultationFee: { type: Number },
    bio: { type: String },
    city: { type: String }, // for location-based search
    clinicAddress: { type: String },

    isApproved: { type: Boolean, default: false },

    weeklyAvailability: [availabilitySchema],
    nmcRegistrationNumber: { type: String },
    documents: {
      degreeCertificate: { type: String },
      registrationCertificate: { type: String },
    },
  },
  { timestamps: true }
);

const doctorProfileModel = mongoose.model('DoctorProfile', doctorProfileSchema);

export default doctorProfileModel