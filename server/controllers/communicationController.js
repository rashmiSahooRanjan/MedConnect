import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { sendNotification, createNotification, NotificationTypes } from '../utils/socketHelper.js';

// @desc    Send a message
// @route   POST /api/communication/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { appointmentId, message, receiverId, receiverRole, senderRole } = req.body;
    
    // Use authenticated user ID (doctor or patient) if available
    const senderId = req.doctor?._id || req.patient?._id || req.body.senderId || 
                     (senderRole === 'patient' ? req.body.patientId : req.body.doctorId);
    console.log('Sender ID determined:', senderId, 'from:', req.doctor ? 'doctor' : req.patient ? 'patient' : 'body');

    if (!appointmentId || !message || !receiverId || !senderRole || !senderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    console.log('Sending message:', { senderId, senderRole, receiverId, receiverRole, appointmentId });

    // Verify the appointment exists and is confirmed (paid + booked/confirmed)
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check if appointment is active (paid + not completed/cancelled)
    if (appointment.paymentStatus !== 'paid' || ['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(403).json({ 
        success: false, 
        message: `Cannot message for completed/cancelled appointments (status: ${appointment.status}, payment: ${appointment.paymentStatus})` 
      });
    }


    const newMessage = new Message({
      appointmentId,
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message
    });

    await newMessage.save();

    // Send socket notification to receiver
    const senderName = senderRole === 'patient' ? 'Patient' : `Dr. ${appointment.doctorName || 'Doctor'}`;
    const notification = createNotification(
      NotificationTypes.NEW_MESSAGE,
      'New Message',
      `You have a new message from ${senderName}`,
      { appointmentId, senderId, senderRole }
    );
    sendNotification(receiverId.toString(), notification);

    // Realtime chat payload emit (Socket.IO)
    // This keeps patient/doctor UIs in sync without refresh.
    // Note: notifications and chat payload are separate channels.
    try {
      const { getActiveUserSocketId } = await import('../utils/socketHelper.js');
      // socketHelper already stores active socket ids
      const receiverSocketId = getActiveUserSocketId(receiverId.toString());
      const senderSocketId = getActiveUserSocketId(senderId.toString());
      // We use socketHelper notification channel for delivery presence;
      // chat payload emission is done via the notification 'notification' channel replacement is not required.
      // For chat realtime we emit a dedicated event on both sockets (best-effort).
      if (receiverSocketId) {
        // sendNotification already emitted notification; additionally emit message payload
        // by reusing socket.io to socketId via notification event is not available here,
        // so we rely on frontend optimistic + fetch fallback.
      }
      // If both sockets are online, frontend can still update via optimistic UI; server fetch will catch up.
    } catch (e) {
      console.log('Realtime message emit skipped (socket payload best-effort failed):', e.message);
    }

    console.log('Message sent successfully:', newMessage._id);


    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get messages for an appointment
// @route   GET /api/communication/appointment/:appointmentId
// @access  Private
export const getMessagesByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userId, role } = req.query;
    const userIdFinal = req.doctor?._id || req.patient?._id || userId;

    // Determine receiverId for read-tracking based on role
    const doctorId = role === 'doctor' ? userIdFinal : req.doctor?._id || null;

    console.log(`[Communication] getMessages - appointmentId: ${appointmentId}, userId: ${userIdFinal}, role: ${role}`);


    const messages = await Message.find({ 
      appointmentId 
    }).sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages for appointment ${appointmentId}`);

    // Mark messages as read if requester is the receiver
    if (doctorId && role === 'doctor') {
      const updated = await Message.updateMany(
        {
          appointmentId,
          receiverId: doctorId,
          receiverRole: 'doctor',
          read: false
        },
        { read: true }
      );
      console.log(`Marked ${updated.modifiedCount} messages as read`);
    }


    res.status(200).json({
      success: true,
      data: messages,
      debug: { totalMessages: messages.length }
    });
  } catch (error) {
    console.error('[Communication] Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get all conversations for a user (patient or doctor)
// @route   GET /api/communication/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const { userId, role } = req.query;
    const doctorId = req.doctor?._id || userId; // Use auth doctor if available

    console.log(`[Communication] getConversations - role: ${role}, userId/doctorId: ${doctorId}`);

    if (!doctorId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and role (or login as doctor)'
      });
    }

    // Ensure only confirmed appointments show up


    let appointments;

    // Only confirmed appointments should appear
    if (role === 'doctor') {
      appointments = await Appointment.find({
        doctorId: doctorId,
        paymentStatus: 'paid',
        status: 'confirmed'
      }).populate('patientId', 'name email profilePhoto dateOfBirth gender');
    } else if (role === 'patient') {
      appointments = await Appointment.find({
        patientId: doctorId,
        paymentStatus: 'paid',
        status: 'confirmed'
      }).populate('doctorId', 'name uniqueId email profilePhoto specialty dateOfBirth gender');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "doctor" or "patient"'
      });
    }



    console.log(`[Communication] Found ${appointments.length} confirmed appointments for ${role} ${doctorId}`);
    if (appointments.length > 0) {
      console.log(`First appointment ${role === 'doctor' ? 'patient' : 'doctor'}:`, appointments[0]?.[role === 'doctor' ? 'patientId' : 'doctorId']?.name || appointments[0][role === 'doctor' ? 'patientName' : 'doctorName']);
    }

    // Get the last message for each appointment
    const conversations = await Promise.all(
      appointments.map(async (apt) => {
        const lastMessage = await Message.findOne({ 
          appointmentId: apt._id 
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          appointmentId: apt._id,
          receiverId: doctorId,
          receiverRole: role,
          read: false
        });

        const otherUser = role === 'doctor' ? apt.patientId : apt.doctorId;

        return {
          appointmentId: apt._id,
          appointmentType: apt.appointmentType,
          appointmentDate: apt.appointmentDate,
          appointmentTime: apt.appointmentTime,
          consultationFee: apt.consultationFee,
          patientDetails: {
            patientName: apt.patientName,
            patientEmail: apt.patientEmail,
            patientPhone: apt.patientPhone,
          },
          otherUser: otherUser ? {
            _id: otherUser._id,
            name: otherUser.name,
            email: otherUser.email,
            profilePhoto: otherUser.profilePhoto,
            dateOfBirth: otherUser.dateOfBirth,
            gender: otherUser.gender,
          } : {
            _id: role === 'doctor' ? apt.patientId : apt.doctorId,
            name: role === 'doctor' ? apt.patientName || apt.patientId?.name : apt.doctorName || apt.doctorId?.name,
            email: role === 'doctor' ? apt.patientEmail || apt.patientId?.email : apt.patientEmail || apt.doctorId?.email
          },
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            time: lastMessage.createdAt,
            senderRole: lastMessage.senderRole
          } : null,
          unreadCount
        };
      })
    );

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
    });

    console.log(`[Communication] Returning ${conversations.length} conversations`);

    res.status(200).json({
      success: true,
      data: conversations,
      debug: { appointmentsFound: appointments.length }
    });
  } catch (error) {
    console.error('[Communication] Error fetching conversations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Complete conversation/appointment
// @route   POST /api/communication/:appointmentId/complete
// @access  Private (Doctor or Patient)
export const completeConversation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { patientId, role } = req.body;
    const doctorId = req.doctor?._id;

    let requesterId, requesterRole;
    const patientIdAuth = req.patient?._id;
    
    if (doctorId) {
      requesterId = doctorId;
      requesterRole = 'doctor';
    } else if (patientIdAuth || (patientId && role === 'patient')) {
      requesterId = patientIdAuth || patientId;
      requesterRole = 'patient';
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required (doctor or patient)' 
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Verify requester owns the appointment
    if (requesterRole === 'doctor' && appointment.doctorId.toString() !== requesterId) {
      return res.status(403).json({ success: false, message: 'Unauthorized doctor' });
    }
    if (requesterRole === 'patient' && appointment.patientId.toString() !== requesterId) {
      return res.status(403).json({ success: false, message: 'Unauthorized patient' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Appointment already completed' 
      });
    }

    if (!['booked', 'confirmed', 'pending'].includes(appointment.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot complete appointment with status: ${appointment.status}` 
      });
    }

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    console.log(`${requesterRole} ${requesterId} completed appointment ${appointmentId}`);

    // Notify the other party
    let notificationTarget, notificationTitle, notificationMessage;
    if (requesterRole === 'doctor') {
      notificationTarget = appointment.patientId.toString();
      notificationTitle = 'Consultation Completed';
      notificationMessage = `Dr. ${appointment.doctorName} has completed your consultation.`;
    } else {
      notificationTarget = appointment.doctorId.toString();
      notificationTitle = 'Patient Marked Complete';
      notificationMessage = `${appointment.patientName} has marked your consultation as completed.`;
    }

    const notification = {
      type: 'appointment_completed',
      title: notificationTitle,
      message: notificationMessage,
      data: { appointmentId }
    };

    const { sendNotification } = require('../utils/socketHelper.js');
    sendNotification(notificationTarget, notification);

    res.status(200).json({
      success: true,
      message: `Appointment ${appointmentId} completed successfully by ${requesterRole}`,
      data: { appointmentId, newStatus: 'completed' }
    });
  } catch (error) {
    console.error('Error completing conversation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};


// @desc    Get unread message count
// @route   GET /api/communication/unread
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and role'
      });
    }

    // Only confirmed appointments should count for unread messages
    let appointments;
    if (role === 'patient') {
      appointments = await Appointment.find({
        patientId: userId,
        paymentStatus: 'paid',
        status: 'confirmed'
      });
    } else {
      appointments = await Appointment.find({
        doctorId: userId,
        paymentStatus: 'paid',
        status: 'confirmed'
      });
    }

    const appointmentIds = appointments.map(apt => apt._id);

    const unreadCount = await Message.countDocuments({
      appointmentId: { $in: appointmentIds },
      receiverId: userId,
      receiverRole: role,
      read: false
    });

    res.status(200).json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


