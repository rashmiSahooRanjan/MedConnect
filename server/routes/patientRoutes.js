import express from 'express';
import { registerPatient, loginPatient, updatePatientProfile, updatePatientPhoto, uploadLabReport, getLabReports, deleteLabReport, changePatientPassword, getPatientById, getActivityHistory, setup2FA, enable2FA, disable2FA, get2FAStatus, verify2FA, verify2FADashboard, deletePatientAccount, getSMSSettings, updateSMSSettings } from '../controllers/patientController.js';
import { upload, uploadLabReport as uploadLabReportMiddleware } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/patients/signup
// @desc    Register a new patient
// @access  Public
router.post('/signup', upload.single('profilePhoto'), registerPatient);

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', getPatientById);

// @route   POST /api/patients/signin
// @desc    Authenticate patient & get token
// @access  Public
router.post('/signin', loginPatient);

// @route   PUT /api/patients/profile/:id
// @desc    Update patient profile
// @access  Private
router.put('/profile/:id', updatePatientProfile);

// @route   PUT /api/patients/profile/photo/:id
// @desc    Update patient profile photo
// @access  Private
router.put('/profile/photo/:id', upload.single('profilePhoto'), updatePatientPhoto);

// @route   PUT /api/patients/change-password/:id
// @desc    Change patient password
// @access  Private
router.put('/change-password/:id', changePatientPassword);

// @route   POST /api/patients/lab-reports/:id
// @desc    Upload a lab report
// @access  Private
router.post('/lab-reports/:id', uploadLabReportMiddleware.single('labReport'), uploadLabReport);

// @route   GET /api/patients/lab-reports/:id
// @desc    Get all lab reports for a patient
// @access  Private
router.get('/lab-reports/:id', getLabReports);

// @route   DELETE /api/patients/lab-reports/:patientId/:reportId
// @desc    Delete a lab report
// @access  Private
router.delete('/lab-reports/:patientId/:reportId', deleteLabReport);

// @route   GET /api/patients/history/:id
// @desc    Get patient activity history
// @access  Private
router.get('/history/:id', getActivityHistory);

// ==================== Two-Factor Authentication Routes ====================

// @route   POST /api/patients/2fa/setup/:id
// @desc    Setup 2FA for patient
// @access  Private
router.post('/2fa/setup/:id', setup2FA);

// @route   POST /api/patients/2fa/enable/:id
// @desc    Enable 2FA after verification
// @access  Private
router.post('/2fa/enable/:id', enable2FA);

// @route   POST /api/patients/2fa/disable/:id
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable/:id', disable2FA);

// @route   GET /api/patients/2fa/status/:id
// @desc    Get 2FA status
// @access  Private
router.get('/2fa/status/:id', get2FAStatus);

// @route   POST /api/patients/2fa/verify
// @desc    Verify 2FA token during login
// @access  Public
router.post('/2fa/verify', verify2FA);
router.post('/2fa/verify/:id', verify2FADashboard);

// @route   DELETE /api/patients/:id
// @desc    Delete patient account permanently
// @access  Private
router.delete('/:id', deletePatientAccount);

// ==================== SMS Notification Settings Routes ====================

// @route   GET /api/patients/sms-settings/:id
// @desc    Get SMS notification settings
// @access  Private
router.get('/sms-settings/:id', getSMSSettings);

// @route   PUT /api/patients/sms-settings/:id
// @desc    Update SMS notification settings
// @access  Private
router.put('/sms-settings/:id', updateSMSSettings);

export default router;
