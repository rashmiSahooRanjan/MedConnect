import express from 'express';
import { protect, authorizeDoctor } from '../middleware/auth.js';
import { 
  sendMessage, 
  getMessagesByAppointment, 
  getConversations,
  getUnreadCount
} from '../controllers/communicationController.js';

const router = express.Router();

import { completeConversation } from '../controllers/communicationController.js';

// @route   POST /api/communication/message
// @desc    Send a message
// @access  Private (Doctor)
router.post('/message', protect, sendMessage);

// @route   GET /api/communication/appointment/:appointmentId
// @desc    Get messages for an appointment
// @access  Private (Doctor or Patient)
router.get('/appointment/:appointmentId', protect, getMessagesByAppointment);

// @route   GET /api/communication/conversations
// @desc    Get all conversations for a user
// @access  Private (Doctor)
router.get('/conversations', getConversations);


// @route   POST /api/communication/complete/:appointmentId
// @desc    Complete conversation/appointment
// @access  Private (Doctor)
router.post('/complete/:appointmentId', completeConversation);

router.get('/unread', protect, authorizeDoctor, getUnreadCount);

export default router;
