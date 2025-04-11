import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  userId: string;
  branchId: string;
  senderId: string;
  senderRole: 'user' | 'branch';
  message: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  branchId: { type: String, required: true },
  restaurantId: { type: String, required: false },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'branch', 'restaurent', 'admin'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', messageSchema);