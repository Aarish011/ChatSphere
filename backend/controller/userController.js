import User from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import mongoose from 'mongoose';

// Helper function for Cloudinary upload
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'chat_app_profiles',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ================= REGISTER USER =================
const RegisterUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Existing user check
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default profile image
    let profilePicUrl =
      'https://res.cloudinary.com/demo/image/upload/v1/samples/avatar_default.png';

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      console.log('Cloudinary Upload:', uploadResult);
      profilePicUrl = uploadResult.secure_url;
    }

    // Create user with searchHistory array
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePic: profilePicUrl,
      bio: '',
      searchHistory: [], // Initialize empty search history
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
      },
    });
  } catch (error) {
    console.log('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGIN USER =================
const LoginUser = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: existingUser._id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        profilePic: existingUser.profilePic,
        bio: existingUser.bio,
      },
    });
  } catch (error) {
    console.log('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= LOGOUT USER =================
const Userlogout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE USER =================
const UpdateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, bio } = req.body;

    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (bio) updateData.bio = bio;

    // Profile Picture update from multer
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.profilePic = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.log('Update User Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET CURRENT USER =================
const GetCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= SEARCH USERS =================
const searchUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      _id: { $ne: loggedInUserId },
      fullName: { $regex: query, $options: 'i' },
    }).select('-password');

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= ADD SEARCH HISTORY =================
const addSearchHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { searchedUserId } = req.params;

    // Validate searchedUserId
    if (!searchedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Missing user id',
      });
    }

    // Check if searched user exists
    const searchedUser = await User.findById(searchedUserId);
    if (!searchedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove if already exists (to move to top) - Fixed ObjectId conversion
    await User.findByIdAndUpdate(userId, {
      $pull: {
        searchHistory: { userId: new mongoose.Types.ObjectId(searchedUserId) },
      },
    });

    // Add to search history
    await User.findByIdAndUpdate(userId, {
      $push: {
        searchHistory: {
          userId: searchedUserId,
          searchedAt: new Date(),
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Search history updated',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET SEARCH HISTORY =================
const getSearchHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Remove .sort() from findById - it doesn't work there
    const user = await User.findById(userId).populate(
      'searchHistory.userId',
      'fullName email profilePic'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Sort manually in memory (correct way)
    const history = (user.searchHistory || []).sort(
      (a, b) => new Date(b.searchedAt) - new Date(a.searchedAt)
    );

    return res.status(200).json({
      success: true,
      history: history.map((item) => ({
        _id: item.userId?._id,
        fullName: item.userId?.fullName || 'Unknown',
        email: item.userId?.email || '',
        profilePic: item.userId?.profilePic || '',
        searchedAt: item.searchedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= CLEAR SEARCH HISTORY =================
const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId, {
      searchHistory: [],
    });

    return res.status(200).json({
      success: true,
      message: 'Search history cleared',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  RegisterUser,
  LoginUser,
  searchUsers,
  Userlogout,
  UpdateUser,
  GetCurrentUser,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
};
