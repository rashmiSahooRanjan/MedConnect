// SMS Service for sending notifications to patients
// This is a DEMO service - No API required!
// SMS messages are logged to console and stored in a local file for demonstration
// In production, you can integrate with any SMS gateway (Twilio, Fast2SMS, etc.)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to store sent SMS logs (for demo purposes)
const SMS_LOG_FILE = path.join(__dirname, 'smsLog.json');

// Initialize log file if it doesn't exist
if (!fs.existsSync(SMS_LOG_FILE)) {
  fs.writeFileSync(SMS_LOG_FILE, JSON.stringify([], null, 2));
}

/**
 * Log SMS to file for demonstration
 */
const logSMS = (phoneNumber, message, type) => {
  try {
    const logs = JSON.parse(fs.readFileSync(SMS_LOG_FILE, 'utf8'));
    const newLog = {
      id: `SMS_${Date.now()}`,
      phoneNumber,
      message,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 100 messages
    if (logs.length > 100) {
      logs.pop();
    }
    
    fs.writeFileSync(SMS_LOG_FILE, JSON.stringify(logs, null, 2));
    console.log(`[SMS LOGGED] ${type} to ${phoneNumber}: ${message.substring(0, 50)}...`);
  } catch (error) {
    console.error('Error logging SMS:', error);
  }
};

/**
 * Send SMS - Demo version (no API required)
 * This function logs SMS to console and saves to file
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message to send
 * @param {string} type - Type of notification
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendSMS = async (phoneNumber, message, type = 'general') => {
  try {
    // Validate phone number
    if (!phoneNumber) {
      console.log('SMS not sent: Phone number is missing');
      return { success: false, message: 'Phone number is required' };
    }

    // Validate message
    if (!message) {
      console.log('SMS not sent: Message is missing');
      return { success: false, message: 'Message is required' };
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Log the SMS (demo mode)
    console.log('\n========== SMS NOTIFICATION ==========');
    console.log(`TO: ${formattedPhone}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`TYPE: ${type}`);
    console.log(`TIME: ${new Date().toLocaleString()}`);
    console.log('======================================\n');

    // Save to log file
    logSMS(formattedPhone, message, type);

    return { 
      success: true, 
      message: 'SMS sent successfully (Demo Mode)',
      demo: true,
      logged: true
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get all sent SMS logs
 */
export const getSMSLogs = async () => {
  try {
    const logs = JSON.parse(fs.readFileSync(SMS_LOG_FILE, 'utf8'));
    return { success: true, logs };
  } catch (error) {
    return { success: false, logs: [], message: error.message };
  }
};

/**
 * Clear SMS logs
 */
export const clearSMSLogs = async () => {
  try {
    fs.writeFileSync(SMS_LOG_FILE, JSON.stringify([], null, 2));
    return { success: true, message: 'SMS logs cleared' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Format phone number for Indian numbers (add country code if not present)
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any spaces, dashes, or parentheses
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // If already starts with +, remove it
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If doesn't start with 91 (India country code), add it
  if (!cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
};

/**
 * Send appointment booking notification
 */
export const sendAppointmentBookingSMS = async (patientPhone, patientName, doctorName, appointmentDate, appointmentTime) => {
  const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} is booked for ${appointmentDate} at ${appointmentTime}. Thank you for choosing MediConnect!`;
  return await sendSMS(patientPhone, message, 'appointment_booking');
};

/**
 * Send payment confirmation SMS
 */
export const sendPaymentConfirmationSMS = async (patientPhone, patientName, amount, doctorName) => {
  const message = `Hi ${patientName}, your payment of Rs.${amount} for appointment with Dr. ${doctorName} has been received. Thank you!`;
  return await sendSMS(patientPhone, message, 'payment_confirmation');
};

/**
 * Send appointment confirmation SMS
 */
export const sendAppointmentConfirmationSMS = async (patientPhone, patientName, doctorName, appointmentDate, appointmentTime) => {
  const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${appointmentDate} at ${appointmentTime} has been CONFIRMED. Please arrive 10 minutes early.`;
  return await sendSMS(patientPhone, message, 'appointment_confirmation');
};

/**
 * Send appointment cancellation SMS
 */
export const sendAppointmentCancellationSMS = async (patientPhone, patientName, doctorName, appointmentDate) => {
  const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} on ${appointmentDate} has been cancelled as per your request.`;
  return await sendSMS(patientPhone, message, 'appointment_cancellation');
};

/**
 * Send refund initiation SMS
 */
export const sendRefundSMS = async (patientPhone, patientName, amount) => {
  const message = `Hi ${patientName}, your refund of Rs.${amount} has been initiated and will be credited to your original payment method within 5-7 business days.`;
  return await sendSMS(patientPhone, message, 'refund');
};

/**
 * Send 2FA enabled SMS
 */
export const send2FAEnabledSMS = async (patientPhone, patientName) => {
  const message = `Hi ${patientName}, Two-Factor Authentication (2FA) has been ENABLED on your MediConnect account. Your account is now more secure!`;
  return await sendSMS(patientPhone, message, '2fa_enabled');
};

/**
 * Send new prescription SMS
 */
export const sendNewPrescriptionSMS = async (patientPhone, patientName, doctorName, date) => {
  const message = `Hi ${patientName}, Dr. ${doctorName} has prescribed medicines for you dated ${date}. Please check your MediConnect app for details and instructions.`;
  return await sendSMS(patientPhone, message, 'new_prescription');
};

/**
 * Send 2FA disabled SMS
 */
export const send2FADisabledSMS = async (patientPhone, patientName) => {
  const message = `Hi ${patientName}, Two-Factor Authentication (2FA) has been DISABLED on your MediConnect account. For security, we recommend keeping 2FA enabled.`;
  return await sendSMS(patientPhone, message, '2fa_disabled');
};

export default {
  sendSMS,
  getSMSLogs,
  clearSMSLogs,
  formatPhoneNumber,
  sendAppointmentBookingSMS,
  sendPaymentConfirmationSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentCancellationSMS,
  sendRefundSMS,
  send2FAEnabledSMS,
  send2FADisabledSMS,
  sendNewPrescriptionSMS
};

