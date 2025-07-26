import { Request, Response } from "express";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils";
import { AppError } from "../utils/AppError";
import { INotificationService } from "../services/NotificationService";

export class NotificationController {
  constructor(private _notificationService: INotificationService) {}

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { role, id } = req.data!;
      const { page = '1', limit = '10' } = req.query;
      const recipientType = role === 'restaurent' ? 'restaurant' : role;
      const { notifications, total } = await this._notificationService.getNotifications(
        recipientType as 'restaurant' | 'branch' | 'user',
        id,
        parseInt(page as string),
        parseInt(limit as string)
      );
      sendResponse(res, HttpStatus.OK, 'Notifications fetched successfully', {
        notifications,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error fetching notifications:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      if (!notificationId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const notification = await this._notificationService.markNotificationAsRead(notificationId);
      if (!notification) {
        throw new AppError(HttpStatus.NotFound, 'Notification not found');
      }
      sendResponse(res, HttpStatus.OK, 'Notification marked as read', notification);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error marking notification as read:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getUnreadNotificationCount(req: Request, res: Response): Promise<void> {
    try {
      const { role, id } = req.data!;
      const recipientType = role === 'restaurent' ? 'restaurant' : role;
      const count = await this._notificationService.getUnreadNotificationCount(
        recipientType as 'restaurant' | 'branch' | 'user',
        id
      );

      console.log('unreadcount',count)
      sendResponse(res, HttpStatus.OK, 'Unread notification count fetched successfully', { count });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error fetching unread notification count:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}