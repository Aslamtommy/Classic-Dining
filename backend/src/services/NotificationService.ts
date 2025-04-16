import { INotificationRepository } from '../repositories/NotificationRepository';
import { INotification } from '../models/Common/Notification';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import AdminModel from '../models/Admin/adminModel';

export interface INotificationService {
  sendNotification(
    adminId: string,
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

export class NotificationService implements INotificationService {
  constructor(private repository: INotificationRepository) {}

  async sendNotification(
    adminId: string,
    message: string,
    recipientType: 'restaurant' | 'branch' | 'user'
  ): Promise<INotification[]> {
    try {
      // Verify super admin
      const superAdmin = await AdminModel.findOne({ _id: adminId, email: 'admin123@gmail.com' });
      if (!superAdmin) {
        throw new AppError(HttpStatus.Unauthorized, 'Only super admin can send notifications');
      }

      if (!message.trim()) {
        throw new AppError(HttpStatus.BadRequest, 'Notification message cannot be empty');
      }

      if (!['restaurant', 'branch', 'user'].includes(recipientType)) {
        throw new AppError(HttpStatus.BadRequest, 'Invalid recipient type');
      }

      return await this.repository.createNotifications(adminId, message, recipientType);
    } catch (error) {
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
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

 
}