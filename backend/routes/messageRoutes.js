import express from 'express';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js';

import {
  getMessages,
  sendMessage,
  markAsSeen,
  getUsersForSidebar,
} from '../controller/messageController.js';

const messageRouter = express.Router();

// Sidebar users
messageRouter.get('/users', userAuth, getUsersForSidebar);

// Send message
messageRouter.post(
  '/send/:receiverId',
  userAuth,
  upload.single('image'),
  sendMessage
);

// Get conversation
messageRouter.get('/:receiverId', userAuth, getMessages);

// Mark messages as seen
messageRouter.put('/mark/:senderId', userAuth, markAsSeen);

export default messageRouter;
