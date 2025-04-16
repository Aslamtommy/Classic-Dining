import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const mongodb = process.env.MONGODB;

const connectDB = async (): Promise<void> => {
  if (!mongodb) {
    console.error('MongoDB URI is not defined in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongodb);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error instanceof Error ? error.stack : error,
    );
    process.exit(1); 
  }
};

export default connectDB;
