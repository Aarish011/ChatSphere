import express from 'express';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/multer.js';
import {
  RegisterUser,
  LoginUser,
  Userlogout,
  UpdateUser,
  searchUsers,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  GetCurrentUser,
} from '../controller/userController.js';
import { getUnreadCount } from '../controller/messageController.js';

const userRouter = express.Router();

// Auth routes
userRouter.post('/login', LoginUser);
userRouter.post('/register', upload.single('profilePic'), RegisterUser);
userRouter.post('/update', upload.single('profilePic'), userAuth, UpdateUser);
userRouter.post('/logout', userAuth, Userlogout);

// Search routes
userRouter.get('/search', userAuth, searchUsers);
userRouter.post('/search/add/:searchedUserId', userAuth, addSearchHistory);
userRouter.get('/search/history', userAuth, getSearchHistory);
userRouter.delete('/search/clear', userAuth, clearSearchHistory);
userRouter.get('/me', userAuth, GetCurrentUser);

// Unread count route
userRouter.get('/unread-count', userAuth, getUnreadCount);

export default userRouter;
