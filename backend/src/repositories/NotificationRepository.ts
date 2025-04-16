import Notification, { INotification } from '../models/Common/Notification';
 
import RestaurentModel from '../models/Restaurent/restaurentModel';
import BranchModel from '../models/Restaurent/Branch/BranchModel';
import UserModel from '../models/User/userModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export interface INotificationRepository {
  createNotifications(
    senderId: string,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user'
  ): Promise<INotification[]>;
  getNotifications(
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }>;
 
}

export class NotificationRepository implements INotificationRepository {
  async createNotifications(
    senderId: string,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user'
  ): Promise<INotification[]> {
    try {
      const notifications: INotification[] = [];

      if (recipientType === 'restaurant') {
        const restaurants = await RestaurentModel.find({ isApproved: true, isBranch: false }).lean();
        for (const restaurant of restaurants) {
          const notification = await new Notification({
            senderId,
            recipientType: 'restaurant',
            recipientId: restaurant._id,
            message,
            timestamp: new Date(),
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
          }).save();
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
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
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }
}