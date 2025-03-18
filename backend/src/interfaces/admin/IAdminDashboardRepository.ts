 

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
}