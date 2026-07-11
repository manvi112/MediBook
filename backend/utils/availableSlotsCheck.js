import appointmentModel from '../models/appointment.js';

export const availableSlotsCheck = async (doctor, date) => {
  const selectedDate = new Date(date);
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

  const daySchedule = doctor.weeklyAvailability.find(d => d.day === dayName);
  if (!daySchedule) return [];

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

  const bookedAppointments = await appointmentModel.find({
    doctor: doctor.user,
    date: selectedDate,
    status: { $in: ['pending', 'confirmed'] },
  });

  const bookedSlots = bookedAppointments.map(a => a.startTime);
  return allSlots.filter(slot => !bookedSlots.includes(slot));
};