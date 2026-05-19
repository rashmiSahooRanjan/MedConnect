import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  chiefComplaint: {
    type: String,
    default: ''
  },
  symptoms: [{
    type: String
  }],
  diagnosis: {
    type: String,
    default: ''
  },
  medicines: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      default: ''
    }
  }],
  tests: [{
    name: {
      type: String,
      required: true
    },
    instructions: {
      type: String,
      default: ''
    }
  }],
  advice: {
    type: String,
    default: ''
  },
  followUpDate: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed'],
    default: 'draft'
  },
  sentToPatient: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
prescriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
