import { INotificationRepository } from '../repositories/NotificationRepository';
import { INotification } from '../models/Common/Notification';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import AdminModel from '../models/Admin/adminModel';
import mongoose from 'mongoose';
import { io } from '../app';

export interface INotificationService {
  sendNotification(
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

export class NotificationService implements INotificationService {
  constructor(private repository: INotificationRepository) {}

  async sendNotification(
    senderId: string | mongoose.Types.ObjectId,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId?: string
  ): Promise<INotification[]> {
    try {
      console.log('Sending notification with senderId:', senderId);
      if (senderId !== 'system') {
        const superAdmin = await AdminModel.findOne({ _id: senderId, email: 'admin123@gmail.com' }).lean();
        if (!superAdmin) {
          throw new AppError(HttpStatus.Unauthorized, 'Only super admin or system can send notifications');
        }
      }

      if (!message.trim()) {
        throw new AppError(HttpStatus.BadRequest, 'Notification message cannot be empty');
      }

      if (!['restaurant', 'branch', 'user'].includes(recipientType)) {
        throw new AppError(HttpStatus.BadRequest, 'Invalid recipient type');
      }

      const notifications = await this.repository.createNotifications(senderId, message, recipientType, recipientId);
      
      if (!io) {
        console.error('Socket.IO instance not initialized');
        throw new AppError(HttpStatus.InternalServerError, 'Socket.IO not initialized');
      }

      notifications.forEach(notification => {
        const room = `${notification.recipientType}_${notification.recipientId}`;
        io.to(room).emit('receiveNotification', notification);
        console.log(`Emitted receiveNotification to room ${room}:`, notification);
      });

      return notifications;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      throw error instanceof AppError
        ? error
        : new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getNotifications(
    recipientType: 'restaurant' | 'branch' | 'user',
    recipientId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      return await this.repository.getNotifications(recipientType, recipientId, page, limit);
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
      const notification = await this.repository.markNotificationAsRead(notificationId);
      if (!notification) {
        throw new AppError(HttpStatus.NotFound, 'Notification not found');
      }

      if (!io) {
        console.error('Socket.IO instance not initialized');
        throw new AppError(HttpStatus.InternalServerError, 'Socket.IO not initialized');
      }

      const room = `${notification.recipientType}_${notification.recipientId}`;
      io.to(room).emit('notificationMarkedAsRead', { notificationId, recipientType: notification.recipientType, recipientId: notification.recipientId });
      console.log(`Emitted notificationMarkedAsRead to room ${room}:`, { notificationId });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error instanceof AppError
        ? error
        : new AppError(
            HttpStatus.InternalServerError,
            `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
          );
    }
  }

  async getUnreadNotificationCount(recipientType: 'restaurant' | 'branch' | 'user', recipientId: string): Promise<number> {
    try {
      return await this.repository.getUnreadNotificationCount(recipientType, recipientId);
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }
}