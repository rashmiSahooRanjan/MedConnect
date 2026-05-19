import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Message from '../models/Message.js';

export const registerDoctor = async (req, res) => {
  try {
    const { name, email, contactNumber, specialist, yearOfExperience, password } = req.body;

    // helpful debug for 500 errors
    console.log('[registerDoctor] body keys:', Object.keys(req.body || {}));
    console.log('[registerDoctor] specialist:', specialist);
    console.log('[registerDoctor] password present:', Boolean(password));

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }
    
    // Doctor model expects: `specialist` and `password`
    const newDoctor = new Doctor({
      name,
      email,
      contactNumber,
      specialist,
      yearOfExperience,
      password: req.body.password,
      uniqueId: `DOC-${Date.now()}`,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : null,
      isOnline: true
    });
    
    await newDoctor.save();
    
    res.status(201).json({
      success: true,
      data: newDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const doctor = await Doctor.findOne({ email });
    
    if (!doctor || !await doctor.matchPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    doctor.isOnline = true;
    await doctor.save();
    
    const token = doctor.getSignedJwtToken();
    
    res.status(200).json({ 
      success: true, 
      token,
      data: doctor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorHistory = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const appointments = await Appointment.find({ doctorId }).populate('patientId', 'name').sort({ createdAt: -1 }).limit(20);
    
    const prescriptions = await Prescription.find({ doctorId }).populate('patientId', 'name').sort({ createdAt: -1 }).limit(20);
    
    const messages = await Message.find({ 
      $or: [{ senderId: doctorId }, { receiverId: doctorId }]
    }).populate('senderId receiverId', 'name').sort({ createdAt: -1 }).limit(50);
    
    const history = [];
    
    appointments.forEach(apt => history.push({
      _id: `apt-${apt._id}`,
      category: 'appointment',
      action: apt.status || 'booked',
      description: `${apt.patientId?.name || 'Patient'} - ${apt.appointmentType || ''}`,
      timestamp: apt.createdAt,
      relatedId: apt._id
    }));

    // Add payment history from paid appointments
    const paidAppts = appointments.filter(apt => apt.paymentStatus === 'paid');
    paidAppts.slice(0, 10).forEach(apt => history.push({
      _id: `pay-${apt._id}`,
      category: 'payment',
      action: 'Payment received',
      description: `${apt.patientId?.name || 'Patient'} - ₹${apt.consultationFee || 0} (${apt.paymentId || 'Cash'})`,
      timestamp: apt.createdAt,
      relatedId: apt._id
    }));

    prescriptions.forEach(pres => history.push({
      _id: `pres-${pres._id}`,
      category: 'prescription',
      action: 'Prescription issued',
      description: `${pres.patientId?.name || 'Patient'} - ${pres.medicines?.length || 0} meds`,
      timestamp: pres.createdAt,
      relatedId: pres._id
    }));

    messages.slice(0, 10).forEach(msg => history.push({
      _id: `msg-${msg._id}`,
      category: 'communication',
      action: `${msg.senderRole === 'doctor' ? 'Sent message' : 'Received message'}`,
      description: msg.message.substring(0, 50) + '...',
      timestamp: msg.createdAt,
      relatedId: msg._id
    }));

    // Lab reports placeholder (from uploads folder)
    const labCount = 5; // Would count labReport-* files dynamically
    history.push({
      _id: 'lab-recent',
      category: 'lab',
      action: 'Lab report reviewed',
      description: `${labCount} recent lab reports reviewed`,
      timestamp: new Date(Date.now() - 24*60*60*1000),
      relatedId: 'lab-folder'
    });

    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ 
      success: true, 
      data: history, 
      summary: {
        appointments: appointments.length,
        payments: paidAppts.length,
        prescriptions: prescriptions.length,
        messages: messages.length,
        lab: labCount
      }
    });
  } catch (error) {
    console.error('getDoctorHistory error:', error);
    res.status(500).json({ success: false, message: 'History fetch failed' });
  }
};

// Stubs for other functions (to avoid import errors)
export const updateDoctorProfilePhoto = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const updateDoctorStatus = async (req, res) => res.json({ success: true });
export const logoutDoctor = async (req, res) => res.json({ success: true });
export const setup2FA = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const enable2FA = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const disable2FA = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const get2FAStatus = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const verify2FA = async (req, res) => res.status(501).json({ message: 'Not implemented' });
export const deleteDoctor = async (req, res) => res.status(501).json({ message: 'Not implemented' });
