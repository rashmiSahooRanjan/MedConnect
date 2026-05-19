import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log('🔍 Auth middleware: Bearer token received');
    
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 Token length:', token ? token.length : 'NO TOKEN');

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medconnect_secret_2024');
      console.log('✅ JWT verified:', decoded.role, decoded.id);

      // Handle both doctor and patient
      // Backward compatibility: some older tokens might not include decoded.role.
      if (!decoded.role) {
        if (req.path.includes('/doctors')) decoded.role = 'doctor';
        else if (req.path.includes('/patients')) decoded.role = 'patient';
      }
      if (decoded.role === 'doctor') {
        req.doctor = await Doctor.findById(decoded.id).select('-password');
        if (!req.doctor) {
          return res.status(401).json({ success: false, message: 'Doctor not found' });
        }
        console.log('✅ Doctor auth:', req.doctor.name);
      } else if (decoded.role === 'patient') {
        req.patient = await Patient.findById(decoded.id).select('-password');
        if (!req.patient) {
          return res.status(401).json({ success: false, message: 'Patient not found' });
        }
        console.log('✅ Patient auth:', req.patient.name);
      } else {
        return res.status(401).json({ success: false, message: 'Invalid user role' });
      }

      next();
    } catch (error) {
      console.error('❌ JWT verify failed:', error.message);
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ success: false, message: 'No token provided' });
  }
};

// Grant access to authenticated doctors (no strict role check)
const authorizeDoctor = (req, res, next) => {
  if (!req.doctor) {
    return res.status(403).json({ success: false, message: 'Doctor access required' });
  }
  next();
};

export { protect, authorizeDoctor };


