// src/controllers/BranchDashboardController.ts
import { Request, Response } from 'express';
import { BranchDashboardService } from '../services/BranchDashboardService';
import { sendResponse, sendError } from '../utils/responseUtils';
import { HttpStatus } from '../constants/HttpStatus';
import { AppError } from '../utils/AppError';
import { MessageConstants } from '../constants/MessageConstants';

export class BranchDashboardController {
  constructor(private dashboardService: BranchDashboardService) {
    console.log('[BranchDashboardController] Initialized with BranchDashboardService');
  }

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const branchId = req.data?.id; // Assumes auth middleware sets branch ID
      if (!branchId) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      }

      const { startDate, endDate, filter } = req.query;
      const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      const parsedEndDate = endDate ? new Date(endDate as string) : undefined;
      const filterValue = filter ? (filter as "daily" | "monthly" | "yearly") : undefined;

      const dashboardData = await this.dashboardService.getDashboardData(branchId, filterValue, parsedStartDate, parsedEndDate);
      sendResponse(res, HttpStatus.OK, 'Dashboard data fetched successfully', dashboardData);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}