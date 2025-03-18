// src/controllers/AdminDashboardController.ts
import { Request, Response } from "express";
 import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils";
import { AppError } from "../utils/AppError";
 import { IAdminDashboardService } from "../interfaces/admin/IAdminDashboardService";

export class AdminDashboardController   {
  constructor(private _adminService: IAdminDashboardService ) {}

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, filter, restaurantId, branchId } = req.query;

      // Validate admin role (assuming req.data is set by auth middleware)
      if (!req.data?.role || req.data.role !== "admin") {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }

      // Validate filter
      const validFilters = ["daily", "monthly", "yearly"];
      const filterValue = (filter as string) || "daily";
      if (!validFilters.includes(filterValue)) {
        throw new AppError(HttpStatus.BadRequest, "Invalid filter value. Must be 'daily', 'monthly', or 'yearly'");
      }

      const data = await this._adminService.getDashboardData(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        filterValue as "daily" | "monthly" | "yearly",
        restaurantId as string,
        branchId as string
      );

      sendResponse(res, HttpStatus.OK, "Dashboard data fetched successfully", data);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}