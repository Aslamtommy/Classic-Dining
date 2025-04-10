// src/interfaces/admin/IAdminDashboardRepository.ts
import { ReservationStatus } from "../../models/User/Reservation";

export interface IAdminDashboardRepository {
  getTotalRevenue(dateFilter: any, restaurantId?: string, branchId?: string): Promise<number>;
  getReservationStats(dateFilter: any, restaurantId?: string, branchId?: string): Promise<{ pending: number; confirmed: number; completed: number; cancelled: number }>;
  getReservationTrends(dateFilter: any, filter: "daily" | "monthly" | "yearly", restaurantId?: string, branchId?: string): Promise<Array<{ date: string; count: number; revenue: number }>>;
  getTopRestaurants(dateFilter: any, restaurantId?: string): Promise<Array<{ _id: string; name: string; revenue: number; reservations: number }>>;
  getBranchActivity(dateFilter: any, restaurantId?: string, branchId?: string): Promise<Array<{ _id: string; name: string; reservations: number }>>;
  getPendingApprovals(): Promise<number>;
  getTopCustomers(dateFilter: any, restaurantId?: string, branchId?: string): Promise<Array<{ _id: string; name: string; email: string; totalBookings: number; totalSpent: number }>>;
  getUserGrowth(dateFilter: any, filter: "daily" | "monthly" | "yearly"): Promise<Array<{ date: string; count: number }>>;
  getSystemHealth(dateFilter: any, restaurantId?: string, branchId?: string): Promise<{ pendingIssues: number; couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }> }>;
  getOverviewCounts(restaurantId?: string, branchId?: string): Promise<{ totalReservations: number; activeRestaurants: number; activeBranches: number; userCount: number }>;
  getRestaurantPerformance(dateFilter: any, filter: "daily" | "monthly" | "yearly"): Promise<Array<{
    restaurantId: string;
    name: string;
    totalRevenue: number;
    totalReservations: number;
    avgRevenuePerReservation: number;
    branches: Array<{ branchId: string; name: string; totalReservations: number; totalRevenue: number }>;
    revenueTrends: Array<{ date: string; revenue: number }>;
  }>>;
  getPerformanceMetrics(dateFilter: any): Promise<{
    customerRetentionRate: number;
    cancellationRate: number;
    peakHours: Array<{ hour: string; count: number }>;
  }>;
}

export interface RestaurantPerformance {
  restaurantId: string;
  name: string;
  totalRevenue: number;
  totalReservations: number;
  avgRevenuePerReservation: number;
  branches: Array<{ branchId: string; name: string; totalReservations: number; totalRevenue: number }>;
  revenueTrends: Array<{ date: string; revenue: number }>;
}

export interface PerformanceMetrics {
  customerRetentionRate: number;
  cancellationRate: number;
  peakHours: Array<{ hour: string; count: number }>;
}

export interface DashboardData {
  overview: { totalRevenue: number; totalReservations: number; activeRestaurants: number; activeBranches: number; userCount: number };
  reservationStats: { pending: number; confirmed: number; completed: number; cancelled: number };
  reservationTrends: Array<{ date: string; count: number; revenue: number }>;
  topRestaurants: Array<{ _id: string; name: string; revenue: number; reservations: number }>;
  branchActivity: Array<{ _id: string; name: string; reservations: number }>;
  pendingApprovals: number;
  topCustomers: Array<{ _id: string; name: string; email: string; totalBookings: number; totalSpent: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  systemHealth: { pendingIssues: number; couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }> };
  restaurantPerformance: RestaurantPerformance[];
  performanceMetrics: PerformanceMetrics;
}