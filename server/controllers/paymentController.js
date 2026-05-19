import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { sendPaymentConfirmationSMS, formatPhoneNumber } from '../utils/smsService.js';
import { logActivity } from '../controllers/appointmentController.js';

// @route   POST /api/payments/process-custom
// @desc    Process custom payment method
// @access  Private
export const processCustomPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, amount, details } = req.body;

    console.log('Processing payment:', { appointmentId, paymentMethod, amount });

    if (!appointmentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment details'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment or already paid'
      });
    }

    const paymentStatus = paymentMethod === 'cod' ? 'cod-pending' : 'paid';
    const status = paymentMethod === 'cod' ? 'booked' : 'booked';
    const paymentId = `PAY-CUSTOM-${Date.now()}-${paymentMethod.toUpperCase()}`;

    // Update appointment
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentId,
      paymentStatus,
      status,
      paymentMethod
    });

    // Log activity
    logActivity(appointment.patientId, 'Payment Completed', `Payment via ${paymentMethod} completed`, 'payment', appointmentId);

    // Send SMS
    if (appointment.patientId) {
      const patient = await Patient.findById(appointment.patientId);
      if (patient?.smsNotifications && patient.smsNotificationSettings?.paymentConfirmation) {
        const formattedPhone = formatPhoneNumber(patient.contactNumber);
        const smsMessage = `Hi ${appointment.patientName}, ₹${amount} payment via ${paymentMethod.toUpperCase()} for Dr. ${appointment.doctorName} confirmed! - MediConnect`;
        await sendPaymentConfirmationSMS(formattedPhone, smsMessage);
      }
    }

    res.json({ 
      success: true, 
      message: 'Payment successful',
      paymentId,
      appointmentId
    });
  } catch (error) {
    console.error('Custom payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};

// Keep getDoctorPayments for compatibility
export const getDoctorPayments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const payments = await Appointment.find({ 
      doctorId,
      paymentStatus: { $in: ['paid', 'cod-pending'] }
    }).sort({ createdAt: -1 });

    const totalEarned = payments.reduce((acc, p) => acc + parseFloat(p.consultationFee || 0), 0);

    res.json({
      success: true,
      data: {
        payments,
        totalEarned,
        totalPayments: payments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
