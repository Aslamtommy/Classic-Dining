import { IAdminDashboardService, DashboardData } from "../interfaces/admin/IAdminDashboardService";
import { IAdminDashboardRepository } from "../interfaces/admin/IAdminDashboardRepository";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class AdminDashboardService implements IAdminDashboardService {
  constructor(private repository: IAdminDashboardRepository) {}

  async getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter: "daily" | "monthly" | "yearly" = "daily",
    restaurantId?: string,
    branchId?: string
  ): Promise<DashboardData> {
    try {
      let dateFilter: { $gte: Date; $lte: Date } = { $gte: new Date(), $lte: new Date() };

      // Apply default date ranges if no custom dates are provided
      if (!startDate || !endDate) {
        const now = new Date();
        if (filter === "daily") {
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          dateFilter = { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1) };
        } else if (filter === "monthly") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { $gte: startOfMonth, $lte: now };
        } else if (filter === "yearly") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          dateFilter = { $gte: startOfYear, $lte: now };
        }
      } else {
        dateFilter = { $gte: startDate, $lte: endDate };
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
        restaurantPerformance,
        performanceMetrics,
      ] = await Promise.all([
        this.repository.getTotalRevenue(dateFilter, restaurantId, branchId),
        this.repository.getReservationStats(dateFilter, restaurantId, branchId),
        this.repository.getReservationTrends(dateFilter, filter, restaurantId, branchId),
        this.repository.getTopRestaurants(dateFilter, restaurantId),
        this.repository.getBranchActivity(dateFilter, restaurantId, branchId),
        this.repository.getPendingApprovals(),
        this.repository.getTopCustomers(dateFilter, restaurantId, branchId),
        this.repository.getUserGrowth(dateFilter, filter),
        this.repository.getSystemHealth(dateFilter, restaurantId, branchId),
        this.repository.getOverviewCounts(restaurantId, branchId),
        this.repository.getRestaurantPerformance(dateFilter, filter),
        this.repository.getPerformanceMetrics(dateFilter),
      ]);

      return {
        overview: {
          totalRevenue,
          totalReservations: overviewCounts.totalReservations,
          activeRestaurants: overviewCounts.activeRestaurants,
          activeBranches: overviewCounts.activeBranches,
          userCount: overviewCounts.userCount,
        },
        reservationStats,
        reservationTrends,
        topRestaurants,
        branchActivity,
        pendingApprovals,
        topCustomers,
        userGrowth,
        systemHealth,
        restaurantPerformance,
        performanceMetrics,
      };
    } catch (error) {
      throw error instanceof AppError ? error : new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}