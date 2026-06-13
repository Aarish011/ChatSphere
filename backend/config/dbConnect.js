import mongoose, { mongo } from 'mongoose';

const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.MONGOCONNECT);
    console.log('DB Connected');
  } catch (error) {
    console.log('DB not connected', error.message);
  }
};

export default dbconnect;
