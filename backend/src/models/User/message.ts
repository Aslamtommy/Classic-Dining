import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  userId: string;
  branchId: string;
  senderId: string;
  senderRole: 'user' | 'branch';
  message: string;
  timestamp: Date;
}

const messageSchema: Schema = new Schema({
  userId: { type: String, required: true },
  branchId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'branch'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', messageSchema);