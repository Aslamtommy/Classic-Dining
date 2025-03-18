// src/interfaces/admin/IAdminDashboardService.ts
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