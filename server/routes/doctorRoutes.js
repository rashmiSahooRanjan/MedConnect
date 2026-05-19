import express from 'express';
import { registerDoctor, loginDoctor, updateDoctor, updateDoctorProfilePhoto, getAvailableDoctors, updateDoctorStatus, logoutDoctor, setup2FA, enable2FA, disable2FA, get2FAStatus, verify2FA, deleteDoctor, getDoctorHistory } from '../controllers/doctorController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/doctors/signup
// @desc    Register a new doctor
// @access  Public
router.post('/signup', upload.single('profilePhoto'), registerDoctor);

// @route   POST /api/doctors/signin
// @desc    Authenticate doctor & get token
// @access  Public
router.post('/signin', loginDoctor);

// @route   GET /api/doctors/available
// @desc    Get all doctors with online status
// @access  Public
router.get('/available', getAvailableDoctors);

// @route   PUT /api/doctors/profile/:id
// @desc    Update doctor profile by ID
// @access  Private
router.put('/profile/:id', updateDoctor);

// @route   PUT /api/doctors/profile/photo/:id
// @desc    Update doctor profile photo by ID
// @access  Private
router.put('/profile/photo/:id', upload.single('profilePhoto'), updateDoctorProfilePhoto);

// @route   POST /api/doctors/heartbeat
// @desc    Update doctor online status (heartbeat)
// @access  Private
router.post('/heartbeat', updateDoctorStatus);

// @route   POST /api/doctors/logout
// @desc    Doctor logout - set online status to false
// @access  Private
router.post('/logout', logoutDoctor);

// @route   PUT /api/doctors/update
// @desc    Update doctor profile
// @access  Private
router.put('/update', updateDoctor);

// @route   PUT /api/doctors/profile/photo
// @desc    Update doctor profile photo
// @access  Private
router.put('/profile/photo', upload.single('profilePhoto'), updateDoctorProfilePhoto);

// ==================== Two-Factor Authentication Routes ====================

// @route   POST /api/doctors/2fa/setup/:id
// @desc    Setup 2FA for doctor
// @access  Private
router.post('/2fa/setup/:id', setup2FA);

// @route   POST /api/doctors/2fa/enable/:id
// @desc    Enable 2FA after verification
// @access  Private
router.post('/2fa/enable/:id', enable2FA);

// @route   POST /api/doctors/2fa/disable/:id
// @desc    Disable 2FA
// @access  Private
router.post('/2fa/disable/:id', disable2FA);

// @route   GET /api/doctors/2fa/status/:id
// @desc    Get 2FA status
// @access  Private
router.get('/2fa/status/:id', get2FAStatus);

// @route   POST /api/doctors/2fa/verify
// @desc    Verify 2FA token during login
// @access  Public
router.post('/2fa/verify', verify2FA);

// @route   GET /api/doctors/:id
// @desc    Get single doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const Doctor = (await import('../models/Doctor.js')).default;
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctors/:id/history
// @desc    Get doctor history (appointments, payments, prescriptions, communication)
// @access  Private
router.get('/:id/history', getDoctorHistory);

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor account permanently
// @access  Private
router.delete('/:id', deleteDoctor);

export default router;
