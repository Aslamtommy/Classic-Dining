import { Request, Response } from 'express';
import { MainDashboardService } from '../services/MainDashboardService';
import { sendResponse, sendError } from '../utils/responseUtils';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { AppError } from '../utils/AppError';

export class MainDashboardController {
  constructor(private dashboardService: MainDashboardService) {}

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const restaurentId = req.data?.id;
      if (!restaurentId) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      }
      const filter = req.query.filter as '7days' | '30days' | 'month' | 'year' | undefined;
      const dashboardData = await this.dashboardService.getDashboardData(restaurentId, filter);
      sendResponse(res, HttpStatus.OK, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error in MainDashboardController:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}