import Notification, { INotification } from '../models/Common/Notification';
import RestaurentModel from '../models/Restaurent/restaurentModel';
import BranchModel from '../models/Restaurent/Branch/BranchModel';
import UserModel from '../models/User/userModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import mongoose from 'mongoose';

export interface INotificationRepository {
  createNotifications(
    senderId: string | mongoose.Types.ObjectId,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId?: string
  ): Promise<INotification[]>;
  getNotifications(
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }>;
  markNotificationAsRead(notificationId: string): Promise<INotification | null>;
  getUnreadNotificationCount(recipientType: 'restaurant' | 'branch' | 'user', recipientId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  async createNotifications(
    senderId: string | mongoose.Types.ObjectId,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId?: string
  ): Promise<INotification[]> {
    try {
      console.log('Creating notifications with senderId:', senderId); // Debug log
      const notifications: INotification[] = [];

      if (recipientId) {
        const notification = await new Notification({
          senderId,
          recipientType,
          recipientId,
          message,
          timestamp: new Date(),
          isRead: false,
          type: message.includes('reservation') ? 'booking' : 'alert', // Set type based on message content
        }).save();
        notifications.push(notification);
      } else {
        if (recipientType === 'restaurant') {
          const restaurants = await RestaurentModel.find({ isApproved: true, isBranch: false }).lean();
          for (const restaurant of restaurants) {
            const notification = await new Notification({
              senderId,
              recipientType: 'restaurant',
              recipientId: restaurant._id,
              message,
              timestamp: new Date(),
              isRead: false,
              type: message.includes('reservation') ? 'booking' : 'alert',
            }).save();
            notifications.push(notification);
          }
        } else if (recipientType === 'branch') {
          const branches = await BranchModel.find({}).lean();
          for (const branch of branches) {
            const notification = await new Notification({
              senderId,
              recipientType: 'branch',
              recipientId: branch._id,
              message,
              timestamp: new Date(),
              isRead: false,
              type: message.includes('reservation') ? 'booking' : 'alert',
            }).save();
            notifications.push(notification);
          }
        } else if (recipientType === 'user') {
          const users = await UserModel.find({ isBlocked: false }).lean();
          for (const user of users) {
            const notification = await new Notification({
              senderId,
              recipientType: 'user',
              recipientId: user._id,
              message,
              timestamp: new Date(),
              isRead: false,
              type: message.includes('reservation') ? 'booking' : 'alert',
            }).save();
            notifications.push(notification);
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getNotifications(
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [notifications, total] = await Promise.all([
        Notification.find({ recipientType, recipientId })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments({ recipientType, recipientId }),
      ]);
      return { notifications, total };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<INotification | null> {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      ).lean();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getUnreadNotificationCount(recipientType: 'restaurant' | 'branch' | 'user', recipientId: string): Promise<number> {
    try {
      return await Notification.countDocuments({ recipientType, recipientId, isRead: false });
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }
}