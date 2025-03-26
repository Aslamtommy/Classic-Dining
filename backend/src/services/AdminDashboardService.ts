// src/services/AdminDashboardService.ts
import { IAdminDashboardService, DashboardData } from "../interfaces/admin/IAdminDashboardService";
import { IAdminDashboardRepository } from "../interfaces/admin/IAdminDashboardRepository";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class AdminDashboardService implements IAdminDashboardService {
  constructor(private _adminDashboardRepo: IAdminDashboardRepository) {}

  async getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter: "daily" | "monthly" | "yearly" = "daily",
    restaurantId?: string,
    branchId?: string
  ): Promise<DashboardData> {
    try {
      let dateFilter: { $gte: Date; $lte: Date };

       
      if (startDate && endDate) {
        dateFilter = { $gte: startDate, $lte: endDate };
      } else {
        const now = new Date();
        if (filter === "daily") {
          // Full current day: 12 AM to 11:59 PM
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(startOfDay);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter = { $gte: startOfDay, $lte: endOfDay };
        } else if (filter === "monthly") {
          // Current month: Start of month to now
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { $gte: startOfMonth, $lte: now };
        } else {
          // Current year: Start of year to now
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          dateFilter = { $gte: startOfYear, $lte: now };
        }
      }

      const [
        totalRevenue,
        reservationStats,
        reservationTrends,
        topRestaurants,
        branchActivity,
        pendingApprovals,
        topCustomers,
        userGrowth,
        systemHealth,
        overviewCounts,
      ] = await Promise.all([
        this._adminDashboardRepo.getTotalRevenue(dateFilter, restaurantId, branchId),
        this._adminDashboardRepo.getReservationStats(dateFilter, restaurantId, branchId),
        this._adminDashboardRepo.getReservationTrends(dateFilter, filter, restaurantId, branchId),
        this._adminDashboardRepo.getTopRestaurants(dateFilter, restaurantId),
        this._adminDashboardRepo.getBranchActivity(dateFilter, restaurantId, branchId),
        this._adminDashboardRepo.getPendingApprovals(),
        this._adminDashboardRepo.getTopCustomers(dateFilter, restaurantId, branchId),
        this._adminDashboardRepo.getUserGrowth(dateFilter, filter),
        this._adminDashboardRepo.getSystemHealth(dateFilter, restaurantId, branchId),
        this._adminDashboardRepo.getOverviewCounts(restaurantId, branchId),
      ]);

      return {
        overview: { totalRevenue, ...overviewCounts },
        reservationStats,
        reservationTrends,
        topRestaurants,
        branchActivity,
        pendingApprovals,
        topCustomers,
        userGrowth,
        systemHealth,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}