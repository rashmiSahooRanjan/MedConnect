import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { sendNotification, createNotification, NotificationTypes } from '../utils/socketHelper.js';
import { 
  formatPhoneNumber, 
  sendAppointmentBookingSMS, 
  sendAppointmentConfirmationSMS, 
  sendAppointmentCancellationSMS,
  sendRefundSMS 
} from '../utils/smsService.js';

// Helper function to log patient activity
export const logActivity = async (patientId, action, description, category, relatedId = '') => {
  try {
    const patient = await Patient.findById(patientId);
    if (patient) {
      patient.activityHistory.push({
        action,
        description,
        category,
        relatedId,
        timestamp: new Date()
      });
      await patient.save();
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Helper function to send SMS notification based on patient preferences
const sendSMSToPatient = async (patientId, smsType, message) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) return;

    // Check if SMS notifications are enabled
    if (!patient.smsNotifications) return;

    // Check specific notification type
    const settings = patient.smsNotificationSettings || {};
    let shouldSend = false;

    switch (smsType) {
      case 'appointmentBooking':
        shouldSend = settings.appointmentBooking;
        break;
      case 'appointmentConfirmation':
        shouldSend = settings.appointmentConfirmation;
        break;
      case 'appointmentCancellation':
        shouldSend = settings.appointmentCancellation;
        break;
      case 'refundNotifications':
        shouldSend = settings.refundNotifications;
        break;
      default:
        shouldSend = true;
    }

    if (!shouldSend) return;

    // Format phone number and send SMS
    const formattedPhone = formatPhoneNumber(patient.contactNumber);
    await sendSMS(formattedPhone, message);
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};

// @route   POST /api/appointments/book
// @desc    Book an appointment
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      doctorSpecialty,
      appointmentType,
      appointmentDate,
      appointmentTime,
      consultationFee,
      notes
    } = req.body;

    const appointment = new Appointment({
      patientId,
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      doctorSpecialty,
      appointmentType,
      appointmentDate,
      appointmentTime,
      consultationFee,
      notes,
      paymentStatus: 'pending'
    });

    const savedAppointment = await appointment.save();

    // Log the activity
    await logActivity(
      patientId,
      'Appointment Booked',
      `Booked appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime}`,
      'appointment',
      savedAppointment._id.toString()
    );
    
    res.status(201).json({
      success: true,
      data: savedAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
};

// @route   PUT /api/appointments/:id/payment
// @desc    Update payment status after successful payment
// @access  Private
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, paymentStatus } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        paymentId,
        paymentStatus,
        status: paymentStatus === 'paid' ? 'booked' : 'cancelled'
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Log payment activity
    if (paymentStatus === 'paid') {
      await logActivity(
        appointment.patientId,
        'Payment Completed',
        `Payment of Rs.${appointment.consultationFee} completed for appointment with Dr. ${appointment.doctorName}`,
        'payment',
        appointment._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// @route   GET /api/appointments/patient/:patientId
// @desc    Get all appointments for a patient
// @access  Private
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Log cancellation activity
    await logActivity(
      appointment.patientId,
      'Appointment Cancelled',
      `Appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} was cancelled`,
      'appointment',
      appointment._id.toString()
    );

    // Send SMS notification for cancellation
    const smsMessage = `Hi ${appointment.patientName}, your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} has been cancelled. - MediConnect`;
    sendSMSToPatient(appointment.patientId, 'appointmentCancellation', smsMessage);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// @route   GET /api/appointments/doctor/:doctorId
// @desc    Get all appointments for a doctor
// @access  Private
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm an appointment
// @access  Private
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
{ status: 'confirmed' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send socket notification to patient
    const notification = createNotification(
      NotificationTypes.APPOINTMENT_CONFIRMED,
      'Appointment Confirmed',
      `Your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been confirmed.`,
      { appointmentId: appointment._id, doctorName: appointment.doctorName }
    );
    sendNotification(appointment.patientId.toString(), notification);

    // Send SMS notification
    const smsMessage = `Hi ${appointment.patientName}, your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been CONFIRMED. Please arrive 10 minutes early. - MediConnect`;
    sendSMSToPatient(appointment.patientId, 'appointmentConfirmation', smsMessage);

    res.status(200).json({
      success: true,
      data: appointment,
      notification: {
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been confirmed.`,
        patientId: appointment.patientId,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        patientName: appointment.patientName
      }
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message
    });
  }
};

// @route   PUT /api/appointments/:id/cancel-with-refund
// @desc    Cancel an appointment and process refund
// @access  Private
export const cancelWithRefund = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if payment was made
    if (appointment.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this appointment'
      });
    }

    // Update appointment with cancellation and refund details
    const refundAmount = appointment.consultationFee;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        paymentStatus: 'refunded',
        refundAmount: refundAmount,
        refundId: `REF-${Date.now()}`,
        notes: req.body.reason || 'Cancelled by doctor'
      },
      { new: true }
    );

    // Log cancellation with refund activity
    await logActivity(
      appointment.patientId,
      'Appointment Cancelled - Refund',
      `Appointment with Dr. ${appointment.doctorName} cancelled. Refund of Rs.${refundAmount} initiated.`,
      'appointment',
      appointment._id.toString()
    );

    // Send socket notification to patient
    const cancelNotification = createNotification(
      NotificationTypes.APPOINTMENT_CANCELLED,
      'Appointment Cancelled - Refund Initiated',
      `Your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} has been cancelled. A refund of ₹${refundAmount} has been initiated.`,
      { appointmentId: appointment._id, doctorName: appointment.doctorName, refundAmount }
    );
    sendNotification(appointment.patientId.toString(), cancelNotification);

    // Send SMS notification for refund
    const refundSmsMessage = `Hi ${appointment.patientName}, your appointment with Dr. ${appointment.doctorName} has been cancelled. Refund of ₹${refundAmount} initiated. Will be credited in 5-7 business days. - MediConnect`;
    sendSMSToPatient(appointment.patientId, 'refundNotifications', refundSmsMessage);

    res.status(200).json({
      success: true,
      data: updatedAppointment,
      refund: {
        amount: refundAmount,
        refundId: updatedAppointment.refundId,
        originalPaymentId: appointment.paymentId
      },
      notification: {
        title: 'Appointment Cancelled - Refund Initiated',
        message: `Your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} has been cancelled. A refund of ₹${refundAmount} has been initiated to your original payment method.`,
        patientId: appointment.patientId,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        patientName: appointment.patientName,
        refundAmount: refundAmount
      }
    });
  } catch (error) {
    console.error('Error cancelling with refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process cancellation and refund',
      error: error.message
    });
  }
};

// @route   PUT /api/appointments/:id/complete
// @desc    Mark an appointment as completed
// @access  Private
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is in a valid state to be completed
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already completed'
      });
    }

    // Update appointment status to completed
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        completedAt: new Date(),
        notes: req.body.notes || 'Appointment completed'
      },
      { new: true }
    );

    // Log completion activity
    await logActivity(
      appointment.patientId,
      'Appointment Completed',
      `Appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} completed`,
      'appointment',
      appointment._id.toString()
    );

    res.status(200).json({
      success: true,
      data: updatedAppointment,
      notification: {
        title: 'Appointment Completed',
        message: `Your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been marked as completed.`,
        patientId: appointment.patientId,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        patientName: appointment.patientName,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName
      }
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error.message
    });
  }
};

// @route   GET /api/appointments/doctor/:doctorId/patient/:patientId
// @desc    Get doctor appointments for specific patient with patient details
// @access  Private
export const getDoctorPatientAppointments = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    const appointments = await Appointment.find({ 
      doctorId, 
      patientId 
    })
    .populate('patientId', 'name email contactNumber bloodGroup') // Populate bloodGroup etc.
    .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor-patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};
