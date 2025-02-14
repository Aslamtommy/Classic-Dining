export interface IAdminService {
  adminLogin(email: string, password: string): Promise<{ admin: any; accessToken: string; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  getPendingManagers(): Promise<any>;
  updateManagerStatus(managerId: string, isBlocked: boolean,  blockReason?: string) : Promise<any>;
  // Updated getAllManagers to support search and filter parameters.
  getAllManagers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ managers: any[]; total: number }>;
  getAllUsers( page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string): Promise<{ users: any[]; total: number }>;
  managerBlock(managerId: string, isBlocked: boolean): Promise<any>;
  blockUser(userId: string, isBlocked: boolean): Promise<any>;
}
 