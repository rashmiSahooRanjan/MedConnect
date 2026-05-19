import express from 'express';
import {
  createPrescription,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  updatePrescription,
  sendPrescriptionToPatient,
  deletePrescription,
  markPrescriptionAsViewed
} from '../controllers/prescriptionController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);


// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor)
router.post('/', createPrescription);

// @route   GET /api/prescriptions/doctor/:doctorId
// @desc    Get all prescriptions for a doctor
// @access  Private (Doctor)
router.get('/doctor/:doctorId', getDoctorPrescriptions);

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get prescriptions for a specific patient
// @access  Private
router.get('/patient/:patientId', getPatientPrescriptions);

// @route   GET /api/prescriptions/appointment/:appointmentId
// @desc    Get prescription by appointment ID
// @access  Private
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription by ID
// @access  Private
router.get('/:id', getPrescriptionById);

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private (Doctor)
router.put('/:id', updatePrescription);

// @route   PUT /api/prescriptions/:id/send
// @desc    Send prescription to patient
// @access  Private (Doctor)
router.put('/:id/send', sendPrescriptionToPatient);

// @route   PUT /api/prescriptions/:id/view
// @desc    Mark prescription as viewed
// @access  Private (Patient)
router.put('/:id/view', markPrescriptionAsViewed);

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription
// @access  Private (Doctor)
router.delete('/:id', deletePrescription);

export default router;
