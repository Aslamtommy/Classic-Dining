import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  senderId: string | mongoose.Types.ObjectId;
  recipientType: 'restaurant' | 'branch' | 'user';
  recipientId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type?: 'message' | 'booking' | 'alert' | 'success';
}

const NotificationSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.Mixed, // Allow string or ObjectId
    required: true,
  },
  recipientType: {
    type: String,
    enum: ['restaurant', 'branch', 'user'],
    required: true,
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['message', 'booking', 'alert', 'success'],
    required: false, // Use required: false instead of optional
  },
});

// Index for efficient queries
NotificationSchema.index({ recipientType: 1, recipientId: 1, timestamp: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);