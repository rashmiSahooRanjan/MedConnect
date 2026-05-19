import Patient from '../models/Patient.js';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneNumber, send2FAEnabledSMS, send2FADisabledSMS } from '../utils/smsService.js';

// Generate unique patient ID
const generatePatientId = () => {
  return `PAT-${Date.now()}`;
};

// Helper function to log patient activity
const logActivity = async (patientId, action, description, category, relatedId = '') => {
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

// @desc    Register new patient
// @route   POST /api/patients/signup
export const registerPatient = async (req, res) => {
  try {
    const { name, email, contactNumber, password } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ message: 'Patient already exists with this email' });
    }

    // Create patient
    const patient = await Patient.create({
      uniqueId: generatePatientId(),
      name,
      email,
      contactNumber,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
      password,
      activityHistory: [{
        action: 'Account Created',
        description: `Patient account created with email ${email}`,
        category: 'account',
        timestamp: new Date()
      }]
    });

    if (patient) {
      res.status(201).json({
        _id: patient._id,
        uniqueId: patient.uniqueId,
        name: patient.name,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePhoto: patient.profilePhoto
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload lab report
// @route   POST /api/patients/lab-reports/:id
export const uploadLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, labName, description } = req.body;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Add new lab report
    const newLabReport = {
      name: name || req.file.originalname,
      labName: labName || '',
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadDate: new Date(),
      description: description || ''
    };

    patient.labReports.push(newLabReport);
    await patient.save();

    // Log the activity
    patient.activityHistory.push({
      action: 'Lab Report Uploaded',
      description: `Uploaded lab report: ${newLabReport.name}`,
      category: 'lab',
      relatedId: newLabReport._id.toString(),
      timestamp: new Date()
    });
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Lab report uploaded successfully',
      labReport: newLabReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: patient._id,
        uniqueId: patient.uniqueId,
        name: patient.name,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePhoto: patient.profilePhoto,
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        twoFactorEnabled: patient.twoFactorEnabled || false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lab reports for a patient
// @route   GET /api/patients/lab-reports/:id
export const getLabReports = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      labReports: patient.labReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lab report
// @route   DELETE /api/patients/lab-reports/:patientId/:reportId
export const deleteLabReport = async (req, res) => {
  try {
    const { patientId, reportId } = req.params;

    // Find patient by id
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Filter out the lab report to delete
    patient.labReports = patient.labReports.filter(
      report => report._id.toString() !== reportId
    );

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Lab report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate patient & get token
// @route   POST /api/patients/signin
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find patient by email
    const patient = await Patient.findOne({ email });

    if (patient && (await patient.matchPassword(password))) {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: patient._id, 
        role: 'patient',
        email: patient.email 
      }, 
      process.env.JWT_SECRET || 'medconnect_secret_2024',
      { expiresIn: '30d' }
    );

    res.json({
        token,  // Add JWT token
        _id: patient._id,
        uniqueId: patient.uniqueId,
        name: patient.name,
        email: patient.email,
        contactNumber: patient.contactNumber,
        profilePhoto: patient.profilePhoto,
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        bloodGroup: patient.bloodGroup || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        twoFactorEnabled: patient.twoFactorEnabled || false
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile/:id
export const updatePatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactNumber, dateOfBirth, gender, bloodGroup, address, emergencyContact } = req.body;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update patient fields (handle empty strings as valid values)
    if (name !== undefined) patient.name = name;
    if (email !== undefined) patient.email = email;
    if (contactNumber !== undefined) patient.contactNumber = contactNumber;
    if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
    if (gender !== undefined) patient.gender = gender;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (address !== undefined) patient.address = address;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;

    const updatedPatient = await patient.save();

    res.json({
      _id: updatedPatient._id,
      uniqueId: updatedPatient.uniqueId,
      name: updatedPatient.name,
      email: updatedPatient.email,
      contactNumber: updatedPatient.contactNumber,
      dateOfBirth: updatedPatient.dateOfBirth,
      gender: updatedPatient.gender,
      bloodGroup: updatedPatient.bloodGroup,
      address: updatedPatient.address,
      emergencyContact: updatedPatient.emergencyContact,
      profilePhoto: updatedPatient.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient profile photo
// @route   PUT /api/patients/profile/photo/:id
export const updatePatientPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update profile photo if file was uploaded
    if (req.file) {
      patient.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updatedPatient = await patient.save();

    res.json({
      _id: updatedPatient._id,
      uniqueId: updatedPatient.uniqueId,
      name: updatedPatient.name,
      email: updatedPatient.email,
      contactNumber: updatedPatient.contactNumber,
      dateOfBirth: updatedPatient.dateOfBirth || '',
      gender: updatedPatient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      profilePhoto: updatedPatient.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change patient password
// @route   PUT /api/patients/change-password/:id
export const changePatientPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify current password
    const isMatch = await patient.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Update password (the pre-save middleware will hash it)
    patient.password = newPassword;
    await patient.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient activity history
// @route   GET /api/patients/history/:id
export const getActivityHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get activity history sorted by timestamp descending
    const activityHistory = patient.activityHistory || [];
    const sortedHistory = activityHistory.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.status(200).json({
      success: true,
      activityHistory: sortedHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient activity history
// @route   GET /api/patients/history/:id
export const getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Sort activity history by timestamp descending (most recent first)
    const activityHistory = patient.activityHistory.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    res.json(activityHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== Two-Factor Authentication Controllers ====================

// @desc    Setup 2FA for patient
// @route   POST /api/patients/2fa/setup/:id
export const setup2FA = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (patient.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-Factor Authentication is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `MediConnect (${patient.email})`,
      length: 32
    });

    // Generate QR code from the otpauth_url
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    patient.twoFactorSecret = secret.base32;
    await patient.save();

    res.status(200).json({
      success: true,
      message: '2FA setup initiated. Verify to enable.',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      tempSecret: secret.base32
    });
  } catch (error) {
    console.error('2FA Setup Error:', error);
    res.status(500).json({ message: 'Error setting up 2FA' });
  }
};

// @desc    Enable 2FA after verification
// @route   POST /api/patients/2fa/enable/:id
export const enable2FA = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, password, twoFactorPassword, code } = req.body;
    // Accept code from frontend and use it as twoFactorPassword if not provided
    const pin = twoFactorPassword || code || '';
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const isMatch = await patient.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    if (patient.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-Factor Authentication is already enabled' });
    }

    if (!patient.twoFactorSecret) {
      return res.status(400).json({ message: 'Please initiate 2FA setup first' });
    }

    const verified = speakeasy.totp.verify({
      secret: patient.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase());
    }

    patient.twoFactorEnabled = true;
    patient.twoFactorPassword = twoFactorPassword || '';
    patient.twoFactorBackupCodes = backupCodes;
    await patient.save();

    patient.activityHistory.push({
      action: '2FA Enabled',
      description: 'Two-Factor Authentication was enabled',
      category: 'account',
      timestamp: new Date()
    });
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication enabled successfully',
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('2FA Enable Error:', error);
    res.status(500).json({ message: 'Error enabling 2FA' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/patients/2fa/disable/:id
export const disable2FA = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-Factor Authentication is not enabled' });
    }

    const isMatch = await patient.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    patient.twoFactorEnabled = false;
    patient.twoFactorSecret = '';
    patient.twoFactorBackupCodes = [];
    await patient.save();

    patient.activityHistory.push({
      action: '2FA Disabled',
      description: 'Two-Factor Authentication was disabled',
      category: 'account',
      timestamp: new Date()
    });
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication disabled successfully'
    });
  } catch (error) {
    console.error('2FA Disable Error:', error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

// @desc    Get 2FA status
// @route   GET /api/patients/2fa/status/:id
export const get2FAStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      twoFactorEnabled: patient.twoFactorEnabled
    });
  } catch (error) {
    console.error('2FA Status Error:', error);
    res.status(500).json({ message: 'Error getting 2FA status' });
  }
};

// @desc    Verify 2FA token during login
// @route   POST /api/patients/2fa/verify
export const verify2FA = async (req, res) => {
  try {
    const { email, token } = req.body;

    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-Factor Authentication is not enabled' });
    }

    // Check if the token matches the 2FA password (6-digit PIN)
    let verified = false;
    
    if (patient.twoFactorPassword && patient.twoFactorPassword === token) {
      verified = true;
    } 
    // Also check TOTP code from authenticator app
    else if (patient.twoFactorSecret) {
      verified = speakeasy.totp.verify({
        secret: patient.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1
      });
    }

    // Check backup codes if not verified yet
    if (!verified && patient.twoFactorBackupCodes) {
      const backupCodeIndex = patient.twoFactorBackupCodes.indexOf(token.toUpperCase());
      if (backupCodeIndex !== -1) {
        patient.twoFactorBackupCodes.splice(backupCodeIndex, 1);
        await patient.save();
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    res.json({
      _id: patient._id,
      uniqueId: patient.uniqueId,
      name: patient.name,
      email: patient.email,
      contactNumber: patient.contactNumber,
      profilePhoto: patient.profilePhoto,
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      twoFactorEnabled: patient.twoFactorEnabled
    });
  } catch (error) {
    console.error('2FA Verify Error:', error);
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
};

// ==================== 2FA Dashboard Verification ====================

export const verify2FADashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { token: code, password } = req.body;

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-Factor Authentication is not enabled' });
    }

    // First verify password
    const passwordMatch = await patient.matchPassword(password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Then verify TOTP code
    let verified = false;
    if (patient.twoFactorSecret) {
      verified = speakeasy.totp.verify({
        secret: patient.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1
      });
    }

    // Check backup codes
    if (!verified && patient.twoFactorBackupCodes) {
      const backupIndex = patient.twoFactorBackupCodes.indexOf(code.toUpperCase());
      if (backupIndex !== -1) {
        patient.twoFactorBackupCodes.splice(backupIndex, 1);
        await patient.save();
        verified = true;
      }
    }

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('2FA Dashboard Verify Error:', error);
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
};

// @desc    Delete patient account permanently
// @route   DELETE /api/patients/:id
// @access  Private
export const deletePatientAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Find patient by id
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify password before deletion
    const isMatch = await patient.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Account deletion failed.' });
    }

    const patientId = patient._id;

    // Import models for cascade deletion
    const Appointment = (await import('../models/Appointment.js')).default;
    const Prescription = (await import('../models/Prescription.js')).default;
    const Message = (await import('../models/Message.js')).default;

    // 1. Delete all appointments for this patient
    const appointments = await Appointment.find({ patientId });
    const appointmentIds = appointments.map(apt => apt._id);

    // 2. Delete all messages related to these appointments
    if (appointmentIds.length > 0) {
      await Message.deleteMany({ appointmentId: { $in: appointmentIds } });
    }

    // 3. Delete all appointments
    await Appointment.deleteMany({ patientId });

    // 4. Delete all prescriptions for this patient
    await Prescription.deleteMany({ patientId });

    // 5. Delete the patient account permanently
    await Patient.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: 'Patient account and all related data deleted permanently',
      deletedData: {
        appointmentsDeleted: appointments.length,
        prescriptionsDeleted: await Prescription.countDocuments({ patientId }),
        messagesDeleted: await Message.countDocuments({ appointmentId: { $in: appointmentIds } })
      }
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
};

// ==================== SMS Notification Settings Controllers ====================

// @desc    Get SMS notification settings
// @route   GET /api/patients/sms-settings/:id
// @access  Private
export const getSMSSettings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      smsNotifications: patient.smsNotifications,
      smsNotificationSettings: patient.smsNotificationSettings || {
        appointmentBooking: true,
        paymentConfirmation: true,
        appointmentConfirmation: true,
        appointmentCancellation: true,
        refundNotifications: true,
        twoFactorAuth: true
      }
    });
  } catch (error) {
    console.error('Get SMS Settings Error:', error);
    res.status(500).json({ message: 'Error getting SMS settings' });
  }
};

// @desc    Update SMS notification settings
// @route   PUT /api/patients/sms-settings/:id
// @access  Private
export const updateSMSSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { smsNotifications, smsNotificationSettings } = req.body;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update SMS notification settings
    if (smsNotifications !== undefined) {
      patient.smsNotifications = smsNotifications;
    }
    
    if (smsNotificationSettings) {
      patient.smsNotificationSettings = {
        appointmentBooking: smsNotificationSettings.appointmentBooking ?? true,
        paymentConfirmation: smsNotificationSettings.paymentConfirmation ?? true,
        appointmentConfirmation: smsNotificationSettings.appointmentConfirmation ?? true,
        appointmentCancellation: smsNotificationSettings.appointmentCancellation ?? true,
        refundNotifications: smsNotificationSettings.refundNotifications ?? true,
        twoFactorAuth: smsNotificationSettings.twoFactorAuth ?? true
      };
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'SMS notification settings updated successfully',
      smsNotifications: patient.smsNotifications,
      smsNotificationSettings: patient.smsNotificationSettings
    });
  } catch (error) {
    console.error('Update SMS Settings Error:', error);
    res.status(500).json({ message: 'Error updating SMS settings' });
  }
};

