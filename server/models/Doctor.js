import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const doctorSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  specialist: {
    type: String,
    required: true
  },
  yearOfExperience: {
    type: Number,
    required: true
  },
  consultationFee: {
    type: String,
    default: '₹500'
  },
  clinicAddress: {
    type: String,
    default: '123 Medical Center, Health Street'
  },
  timing: {
    type: String,
    default: '9:00 AM - 5:00 PM'
  },
  availableFrom: {
    type: String,
    default: '09:00'
  },
  availableTo: {
    type: String,
    default: '17:00'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  // Two-Factor Authentication fields
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: ''
  },
  twoFactorBackupCodes: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT token
doctorSchema.methods.getSignedJwtToken = function() {
  // IMPORTANT: auth middleware expects decoded.role to be exactly "doctor"
  return jwt.sign(
    { id: this._id, role: 'doctor' },
    process.env.JWT_SECRET || 'medconnect_secret_2024',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};


// Match password method
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
