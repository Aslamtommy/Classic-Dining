// src/services/BranchDashboardService.ts
import TableType from '../models/Restaurent/TableModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { ReservationStatus } from '../models/User/Reservation';
import { BranchDashboardRepository } from '../repositories/BracnDashboardRepository';
  

interface ReservationStatRaw { _id: string; count: number; }
interface RevenueStatRaw { _id: string; totalAmount: number; }
interface ReservationTrendRaw { _id: string; count: number; revenue: number; }
interface TableUtilizationRaw { _id: string; totalBookings: number; }
interface TopCustomerRaw { userId: string; name: string; totalBookings: number; totalSpent: number; }
interface CouponUsageRaw { _id: string; timesUsed: number; totalDiscount: number; }

interface DashboardData {
  reservationStats: { totalPending: number; totalConfirmed: number; totalCompleted: number; totalCancelled: number };
  revenueStats: { totalRevenueFromCompleted: number; totalPendingRevenue: number; totalRefundsIssued: number };
  reservationTrends: Array<{ date: string; count: number; revenue: number }>;
  tableUtilization: Array<{ tableType: string; totalBookings: number }>;
  topCustomers: Array<{ userId: string; name: string; totalBookings: number; totalSpent: number }>;
  couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }>;
}

export class BranchDashboardService {
  constructor(private dashboardRepo: BranchDashboardRepository) {}

  async getDashboardData(branchId: string, filter?: "daily" | "monthly" | "yearly", startDate?: Date, endDate?: Date): Promise<DashboardData> {
    try {
      if (!branchId || typeof branchId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(branchId)) {
        throw new AppError(HttpStatus.BadRequest, 'Invalid branch ID format');
      }

      let dateFilter: { $gte: Date; $lte: Date } | undefined;
      if (startDate && endDate) {
        if (startDate > endDate) throw new AppError(HttpStatus.BadRequest, 'Start date must be before end date');
        dateFilter = { $gte: startDate, $lte: endDate };
      } else if (filter) {
        const now = new Date();
        if (filter === "daily") {
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(startOfDay);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter = { $gte: startOfDay, $lte: endOfDay };
        } else if (filter === "monthly") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { $gte: startOfMonth, $lte: now };
        } else if (filter === "yearly") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          dateFilter = { $gte: startOfYear, $lte: now };
        }
      }

      const [
        reservationStatsRaw,
        revenueStatsRaw,
        reservationTrendsRaw,
        tableUtilizationRaw,
        topCustomers,
        couponUsage,
      ] = await Promise.all([
        this.dashboardRepo.getReservationStats(branchId, dateFilter),
        this.dashboardRepo.getRevenueStats(branchId, dateFilter),
        this.dashboardRepo.getReservationTrends(branchId, dateFilter),
        this.dashboardRepo.getTableUtilization(branchId, dateFilter),
        this.dashboardRepo.getTopCustomers(branchId, dateFilter),
        this.dashboardRepo.getCouponUsage(branchId, dateFilter),
      ]);

      const reservationStats = {
        totalPending: reservationStatsRaw.find((s: ReservationStatRaw) => s._id === ReservationStatus.PENDING)?.count || 0,
        totalConfirmed: reservationStatsRaw.find((s: ReservationStatRaw) => s._id === ReservationStatus.CONFIRMED)?.count || 0,
        totalCompleted: reservationStatsRaw.find((s: ReservationStatRaw) => s._id === ReservationStatus.COMPLETED)?.count || 0,
        totalCancelled: reservationStatsRaw.find((s: ReservationStatRaw) => s._id === ReservationStatus.CANCELLED)?.count || 0,
      };

      const revenueStats = {
        totalRevenueFromCompleted: revenueStatsRaw.find((r: RevenueStatRaw) => r._id === ReservationStatus.COMPLETED)?.totalAmount || 0,
        totalPendingRevenue: revenueStatsRaw.find((r: RevenueStatRaw) => r._id === ReservationStatus.CONFIRMED)?.totalAmount || 0,
        totalRefundsIssued: revenueStatsRaw.find((r: RevenueStatRaw) => r._id === ReservationStatus.CANCELLED)?.totalAmount || 0,
      };

      const reservationTrends = reservationTrendsRaw.map((trend: ReservationTrendRaw) => ({
        date: trend._id,
        count: trend.count,
        revenue: trend.revenue || 0,
      }));

      const tableTypes = await TableType.find({ branch: branchId });
      const tableUtilization = tableUtilizationRaw.map((util: TableUtilizationRaw) => {
        const tableType = tableTypes.find((tt) => tt._id.toString() === util._id.toString());
        return { tableType: tableType ? tableType.name : 'Unknown', totalBookings: util.totalBookings };
      });

      const couponUsageFormatted = couponUsage.map((usage: CouponUsageRaw) => ({
        code: usage._id || 'Unknown',
        timesUsed: usage.timesUsed || 0,
        totalDiscount: usage.totalDiscount || 0,
      }));

      return {
        reservationStats,
        revenueStats,
        reservationTrends,
        tableUtilization,
        topCustomers,
        couponUsage: couponUsageFormatted,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}