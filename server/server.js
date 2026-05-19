import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

// Load dotenv FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import { setIO, setActiveUser, removeActiveUser, getActiveUserSocketId } from './utils/socketHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug: Log Razorpay key status
console.log('=== Environment Debug ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
console.log('=========================');

const app = express();
const server = http.createServer(app);

// Socket.io setup for call signaling
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Export io for use in controllers
export { io };

// Initialize socket helper with io instance
setIO(io);


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers with their ID
  socket.on('register', (userId) => {
    setActiveUser(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle call initiation
  socket.on('call-user', (data) => {
    const { callerId, callerName, callerRole, receiverId, callType, appointmentId } = data;
    const receiverSocketId = getActiveUserSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incoming-call', {
        callerId,
        callerName,
        callerRole,
        callType,
        appointmentId,
        socketId: socket.id
      });
      console.log(`Call initiated from ${callerId} to ${receiverId}, type: ${callType}`);
    } else {
      // User not online
      socket.emit('user-not-online', { receiverId });
    }
  });

  // Handle call acceptance
  socket.on('accept-call', (data) => {
    const { callerSocketId, receiverId, appointmentId } = data;
    console.log(`Call accepted by ${receiverId}, notifying caller at socket ${callerSocketId}`);
    io.to(callerSocketId).emit('call-accepted', {
      receiverId,
      appointmentId,
      socketId: socket.id, // This is the receiver's socket ID
      receiverSocketId: socket.id // Also send explicitly for clarity
    });
    console.log(`Call accepted event sent to caller`);
  });

  // Handle call rejection
  socket.on('reject-call', (data) => {
    const { callerSocketId, receiverId } = data;
    io.to(callerSocketId).emit('call-rejected', { receiverId });
    console.log(`Call rejected by ${receiverId}`);
  });

  // Handle call end
  socket.on('end-call', (data) => {
    const { otherUserSocketId } = data;
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit('call-ended');
    }
    console.log('Call ended');
  });

  // Handle ICE candidate exchange
  socket.on('ice-candidate', (data) => {
    const { candidate, targetSocketId } = data;
    io.to(targetSocketId).emit('ice-candidate', {
      candidate,
      fromSocketId: socket.id
    });
  });

  // Handle SDP offer (caller -> callee)
  socket.on('sdp-offer', (data) => {
    const { sdp, targetSocketId } = data;
    io.to(targetSocketId).emit('sdp-offer', {
      sdp,
      fromSocketId: socket.id
    });
    console.log('SDP offer sent to:', targetSocketId);
  });

  // Handle SDP answer (callee -> caller)
  socket.on('sdp-answer', (data) => {
    const { sdp, targetSocketId } = data;
    io.to(targetSocketId).emit('sdp-answer', {
      sdp,
      fromSocketId: socket.id
    });
    console.log('SDP answer sent to:', targetSocketId);
  });

  // Handle disconnect

  socket.on('disconnect', () => {
    // Remove user from active users
    removeActiveUser(socket.id);
  });
});


// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
import diseaseRoutes from './routes/diseaseRoutes.js';
app.use('/api/disease', diseaseRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MedConnect API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

import { spawn } from 'child_process';

// Start Python ML service
let pythonProcess = null;
function startPythonService() {
  const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  const appDir = path.join(__dirname, '..', 'disease detection');
  
  pythonProcess = spawn(pythonPath, ['app.py'], {
    cwd: appDir,
    env: {
      ...process.env,
      PORT: '5001',
      PYTHONUNBUFFERED: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python ML]: ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python ML ERROR]: ${data.toString().trim()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python ML service exited with code ${code}`);
    // Restart after 5s
    setTimeout(startPythonService, 5000);
  });

  console.log('🚀 Started Python ML Disease Detection service on port 5001');
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPythonService();
});

