import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientType: 'restaurant' | 'branch' | 'user';
  recipientId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

const NotificationSchema: Schema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  recipientType: { type: String, enum: ['restaurant', 'branch', 'user'], required: true },
  recipientId: { type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

// Index for efficient queries
NotificationSchema.index({ recipientType: 1, recipientId: 1, timestamp: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);