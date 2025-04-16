import { Request, Response } from 'express';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
import { AppError } from '../utils/AppError';
import { IAdminDashboardService } from '../interfaces/admin/IAdminDashboardService';
import { NotificationService } from '../services/NotificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { io } from '../app';

export class AdminDashboardController {
  private _notificationService: NotificationService;

  constructor(private _adminService: IAdminDashboardService) {
    const notificationRepository = new NotificationRepository();
    this._notificationService = new NotificationService(notificationRepository);
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, filter, restaurantId, branchId } = req.query;

      if (!req.data?.role || req.data.role !== 'admin') {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }

      const validFilters = ['daily', 'monthly', 'yearly'];
      const filterValue = (filter as string) || 'daily';
      if (!validFilters.includes(filterValue)) {
        throw new AppError(
          HttpStatus.BadRequest,
          "Invalid filter value. Must be 'daily', 'monthly', or 'yearly'"
        );
      }

      const data = await this._adminService.getDashboardData(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        filterValue as 'daily' | 'monthly' | 'yearly',
        restaurantId as string,
        branchId as string
      );

      sendResponse(res, HttpStatus.OK, 'Dashboard data fetched successfully', data);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error in AdminDashboardController:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { message, recipientType } = req.body;
      const adminId = req.data?. id;

      if (!req.data?.role || req.data.role !== 'admin') {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }

      if (!adminId) {
        throw new AppError(HttpStatus.Unauthorized, 'Admin ID not found');
      }

      const notifications = await this._notificationService.sendNotification(
        adminId,
        message,
        recipientType
      );

      // Broadcast notifications via Socket.IO
      for (const notification of notifications) {
        io.to(`${notification.recipientType}_${notification.recipientId}`).emit(
          'receiveNotification',
          notification
        );
      }

      sendResponse(res, HttpStatus.OK, 'Notifications sent successfully', { notifications });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error in sendNotification:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}