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

export interface IAdminDashboardService {
  getDashboardData(
    startDate?: Date,
    endDate?: Date,
    filter?: "daily" | "monthly" | "yearly",
    restaurantId?: string,
    branchId?: string
  ): Promise<DashboardData>;
}