import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import { sendNotification, createNotification, NotificationTypes } from '../utils/socketHelper.js';
import { sendNewPrescriptionSMS } from '../utils/smsService.js';


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

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
export const createPrescription = async (req, res) => {
  console.log('Create prescription request body:', req.body);
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      patientName,
      doctorName,
      date,
      diagnosis,
      medicines,
      advice,
      followUpDate
    } = req.body;

    const formattedMedicines = Array.isArray(medicines) ? medicines.map(m => ({
      name: m.name || m,
      dosage: m.dosage || m.dose || '',
      frequency: m.frequency || '',
      duration: m.duration || '',
      instructions: m.instructions || ''
    })) : [];

    const prescription = new Prescription({
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      patientName,
      doctorName,
      date: date || new Date().toLocaleDateString(),
      diagnosis: diagnosis || '',
      medicines: formattedMedicines,
      tests: [],
      advice: Array.isArray(advice) ? advice.join('\\n') : advice || '',
      followUpDate: followUpDate || '',
      status: 'draft'
    });

    const createdPrescription = await prescription.save();
    console.log('Created prescription:', createdPrescription._id);

    res.status(201).json({
      success: true,
      data: createdPrescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

// @desc    Get all prescriptions for a doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Private (Doctor)
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name profilePhoto phone email')
      .populate('appointmentId', 'patientPhone appointmentDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
};

// @desc    Get prescriptions for a specific patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient prescriptions',
      error: error.message
    });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

// @desc    Get prescription by appointment ID
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const prescription = await Prescription.findOne({ appointmentId });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found for this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.patientId;
    delete updateData.doctorId;
    delete updateData.appointmentId;
    delete updateData.createdAt;

    updateData.updatedAt = Date.now();

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

// @desc    Send prescription to patient
// @route   PUT /api/prescriptions/:id/send
// @access  Private (Doctor)
export const sendPrescriptionToPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientPhone } = req.body; // Optional, fallback to appointment

    let prescription = await Prescription.findById(id).populate({
      path: 'appointmentId',
      select: 'patientPhone appointmentDate'
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    prescription = await Prescription.findByIdAndUpdate(
      id,
      {
        status: 'sent',
        sentToPatient: true,
        sentAt: new Date()
      },
      { new: true }
    );

    const patientPhoneFinal = patientPhone || prescription.appointmentId?.patientPhone;

    if (patientPhoneFinal) {
      await sendNewPrescriptionSMS(
        patientPhoneFinal,
        prescription.patientName,
        prescription.doctorName,
        prescription.date
      );
    }

    // Log the activity when prescription is sent to patient
    await logActivity(
      prescription.patientId,
      'Prescription Received',
      `Received prescription from Dr. ${prescription.doctorName} dated ${prescription.date}`,
      'prescription',
      prescription._id.toString()
    );

    // Send socket notification to patient
    const notification = createNotification(
      NotificationTypes.NEW_PRESCRIPTION,
      'New Prescription Received',
      `Dr. ${prescription.doctorName} has sent you a prescription`,
      { prescriptionId: prescription._id, doctorName: prescription.doctorName }
    );
    sendNotification(prescription.patientId.toString(), notification);

    res.status(200).json({
      success: true,
      message: 'Prescription sent to patient successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Error sending prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send prescription',
      error: error.message
    });
  }
};


// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Doctor)
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: error.message
    });
  }
};

// @desc    Mark prescription as viewed
// @route   PUT /api/prescriptions/:id/view
// @access  Private (Patient)
export const markPrescriptionAsViewed = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status: 'viewed' },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error marking prescription as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};
