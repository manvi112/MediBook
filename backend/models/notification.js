import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'appointment_booked',
        'appointment_confirmed',
        'appointment_cancelled',
        'appointment_reminder',
      ],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model('Notification', notificationSchema);

export default notificationModel;