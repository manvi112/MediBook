export const appointmentBookedDoctor = (patientName, date, startTime) => ({
  subject: 'New Appointment Request',
  html: `
    <h2>New Appointment Request</h2>
    <p>You have a new appointment request from <strong>${patientName}</strong></p>
    <p>Date: <strong>${date}</strong></p>
    <p>Time: <strong>${startTime}</strong></p>
    <p>Please log in to MediBook to confirm or reject this appointment.</p>
  `
});

export const appointmentConfirmedPatient = (doctorName, date, startTime) => ({
  subject: 'Appointment Confirmed',
  html: `
    <h2>Appointment Confirmed</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been confirmed.</p>
    <p>Date: <strong>${date}</strong></p>
    <p>Time: <strong>${startTime}</strong></p>
    <p>Please be on time. Log in to MediBook to view details.</p>
  `
});

export const appointmentCancelledPatient = (doctorName, date, startTime) => ({
  subject: 'Appointment Cancelled',
  html: `
    <h2>Appointment Cancelled</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been cancelled.</p>
    <p>Date: <strong>${date}</strong></p>
    <p>Time: <strong>${startTime}</strong></p>
    <p>Please log in to MediBook to book a new appointment.</p>
  `
});

export const appointmentCancelledDoctor = (patientName, date, startTime) => ({
  subject: 'Appointment Cancelled by Patient',
  html: `
    <h2>Appointment Cancelled</h2>
    <p><strong>${patientName}</strong> has cancelled their appointment.</p>
    <p>Date: <strong>${date}</strong></p>
    <p>Time: <strong>${startTime}</strong></p>
  `
});

export const appointmentCompletedPatient = (doctorName) => ({
  subject: 'Appointment Completed',
  html: `
    <h2>Appointment Completed</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been marked as completed.</p>
    <p>Thank you for using MediBook. We hope you had a great experience.</p>
  `
});