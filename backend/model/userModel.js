import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default:
        'https://res.cloudinary.com/demo/image/upload/v1/samples/avatar_default.png',
    },
    bio: {
      type: String,
      default: '',
    },
    searchHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        searchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
