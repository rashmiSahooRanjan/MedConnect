import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema({
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
  dateOfBirth: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
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
  twoFactorPassword: {
    type: String,
    default: ''
  },
  twoFactorBackupCodes: [{
    type: String
  }],
  // SMS Notification preferences
  smsNotifications: {
    type: Boolean,
    default: true
  },
  smsNotificationSettings: {
    appointmentBooking: { type: Boolean, default: true },
    paymentConfirmation: { type: Boolean, default: true },
    appointmentConfirmation: { type: Boolean, default: true },
    appointmentCancellation: { type: Boolean, default: true },
    refundNotifications: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: true }
  },
  labReports: [{
    name: {
      type: String,
      required: true
    },
    labName: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: ''
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  activityHistory: [{
    action: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['account', 'profile', 'appointment', 'lab', 'prescription', 'payment', 'communication'],
      required: true
    },
    relatedId: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Hash password before saving
patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
patientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
