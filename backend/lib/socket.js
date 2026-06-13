import { Server } from 'socket.io';
import Message from '../model/messageModel.js';

let io;

const userSocketMap = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Typing indicator events
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId: userId });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId: userId });
      }
    });

    // Mark messages as seen when user opens chat
    socket.on('markSeen', async ({ senderId, receiverId }) => {
      try {
        const result = await Message.updateMany(
          {
            senderId: senderId,
            receiverId: receiverId,
            seen: false,
          },
          { seen: true }
        );

        // Notify the sender that messages have been seen
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesSeen', {
            by: receiverId,
            senderId: senderId,
          });
        }

        // Also emit to update unread counts
        io.emit('updateUnreadCount', { userId: receiverId });
      } catch (error) {
        console.error('Mark seen error:', error);
      }
    });

    // Mark message as delivered when received
    socket.on('messageDelivered', async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { delivered: true });

        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageDelivered', { messageId });
        }
      } catch (error) {
        console.error('Message delivered error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected:', socket.id);
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });
};

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { initSocket, io, getReceiverSocketId };
