// Socket helper utility to send notifications to patients
// This will be imported by controllers to emit notifications
import { Server } from 'socket.io';
import http from 'http';

// Create a minimal io instance for notification sending
// In production, you would pass io from server.js
let ioInstance = null;

// Store active users: { userId: socketId }
const activeUsers = new Map();

// Initialize with existing io instance (call this from server.js)
export const initializeSocketHelper = (io) => {
  ioInstance = io;
};

export const setIO = (io) => {
  ioInstance = io;
};

export const setActiveUser = (userId, socketId) => {
  activeUsers.set(userId, socketId);
};

export const removeActiveUser = (socketId) => {
  for (let [userId, sid] of activeUsers.entries()) {
    if (sid === socketId) {
      activeUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
      break;
    }
  }
};

export const getActiveUserSocketId = (userId) => {
  return activeUsers.get(userId);
};

export const sendNotification = (userId, notification) => {
  if (!ioInstance) {
    console.log('Socket io not initialized, notification not sent:', notification.title);
    return false;
  }
  
  const socketId = activeUsers.get(userId);
  if (socketId) {
    ioInstance.to(socketId).emit('notification', notification);
    console.log(`Notification sent to user ${userId}:`, notification.title);
    return true;
  }
  console.log(`User ${userId} is not online, notification queued:`, notification.title);
  return false;
};

// Types of notifications
export const NotificationTypes = {
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  NEW_MESSAGE: 'new_message',
  NEW_PRESCRIPTION: 'new_prescription',
  INCOMING_CALL: 'incoming_call',
  PAYMENT_RECEIVED: 'payment_received'
};

export const createNotification = (type, title, message, data = {}) => {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    data,
    timestamp: new Date(),
    read: false
  };
};

