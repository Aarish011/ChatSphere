import mongoose from 'mongoose';
import Message from '../model/messageModel.js';
import cloudinary from '../config/cloudinary.js';
import User from '../model/userModel.js';
import { io, getReceiverSocketId } from '../lib/socket.js';
import streamifier from 'streamifier';

const sendMessage = async (req, res) => {
  try {
    
    const senderId = req.user.userId;
    const { text } = req.body;
    const { receiverId } = req.params;

    // Validate message has content
    if ((!text || !text.trim()) && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    let imageUrl = '';

    // Upload image to Cloudinary if present
    if (req.file) {
      const uploadResponse = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResponse.secure_url;
    }

    // Create message
    const newMessage = await Message.create({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      text: text || '',
      image: imageUrl,
      seen: false,
      delivered: false,
    });

    // Populate sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'fullName profilePic')
      .populate('receiverId', 'fullName profilePic');

    // Emit to receiver via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', populatedMessage);

      // Mark as delivered
      await Message.findByIdAndUpdate(newMessage._id, { delivered: true });
      io.to(receiverSocketId).emit('messageDelivered', {
        messageId: newMessage._id,
        senderId: senderId,
      });
    }

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.log('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: senderId,
          receiverId: receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAsSeen = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { senderId } = req.params;

    const result = await Message.updateMany(
      {
        senderId: new mongoose.Types.ObjectId(senderId),
        receiverId: new mongoose.Types.ObjectId(userId),
        seen: false,
      },
      {
        seen: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Messages marked as seen',
      count: result.modifiedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    // ✅ FIX: Convert to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(loggedInUserId);

    const unreadMessages = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          seen: false,
        },
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadMessages.forEach((item) => {
      // ✅ FIX: Convert ObjectId to string for React keys
      unreadMap[item._id.toString()] = item.count;
    });

    return res.status(200).json({
      success: true,
      unreadCounts: unreadMap,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    // ✅ FIX: Convert to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(loggedInUserId);

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');

    // Get unread counts for each user
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          seen: false,
        },
      },
      {
        $group: {
          _id: '$senderId',
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((item) => {
      // ✅ FIX: Convert ObjectId to string
      unreadMap[item._id.toString()] = item.count;
    });

    const usersWithUnread = users.map((user) => ({
      ...user.toObject(),
      unreadCount: unreadMap[user._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      users: usersWithUnread,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'chat_app_images',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export {
  getMessages,
  sendMessage,
  markAsSeen,
  getUnreadCount,
  getUsersForSidebar,
  uploadToCloudinary,
};
