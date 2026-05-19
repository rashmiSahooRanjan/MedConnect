import express from 'express';
import { 
  bookAppointment, 
  updatePaymentStatus, 
  getPatientAppointments, 
  getAppointmentById,
  cancelAppointment,
  getDoctorAppointments,
  confirmAppointment,
  cancelWithRefund,
  completeAppointment,
  getDoctorPatientAppointments
} from '../controllers/appointmentController.js';

const router = express.Router();

// @route   POST /api/appointments/book
// @desc    Book an appointment
// @access  Private
router.post('/book', bookAppointment);

// @route   PUT /api/appointments/:id/payment
// @desc    Update payment status after successful payment
// @access  Private
router.put('/:id/payment', updatePaymentStatus);

// @route   GET /api/appointments/patient/:patientId
// @desc    Get all appointments for a patient
// @access  Private
router.get('/patient/:patientId', getPatientAppointments);

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
// @access  Private
router.get('/:id', getAppointmentById);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.put('/:id/cancel', cancelAppointment);

// @route   GET /api/appointments/doctor/:doctorId
// @desc    Get all appointments for a doctor
// @access  Private
router.get('/doctor/:doctorId', getDoctorAppointments);

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm an appointment
// @access  Private
router.put('/:id/confirm', confirmAppointment);

// @route   PUT /api/appointments/:id/cancel-with-refund
// @desc    Cancel an appointment and process refund
// @access  Private
router.put('/:id/cancel-with-refund', cancelWithRefund);

// @route   PUT /api/appointments/:id/complete
// @desc    Mark an appointment as completed
// @access  Private
router.put('/:id/complete', completeAppointment);

// @route   GET /api/appointments/doctor/:doctorId/patient/:patientId
// @desc    Get doctor appointments for specific patient
// @access  Private
router.get('/doctor/:doctorId/patient/:patientId', getDoctorPatientAppointments);

export default router;
