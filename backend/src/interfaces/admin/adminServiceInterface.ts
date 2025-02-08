export interface IAdminService {
    adminLogin(email: string, password: string): Promise<{ admin: any; accessToken: string; refreshToken: string }>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
    getPendingManagers(): Promise<any>;
    updateManagerStatus(managerId: string, isBlocked: boolean): Promise<any>;
    getAllManagers(page: number, limit: number): Promise<{ managers: any[]; total: number }>;
    getAllUsers(page: number, limit: number): Promise<{ users: any[]; total: number }>;
    managerBlock(managerId: string, isBlocked: boolean): Promise<any>;
    blockUser(userId: string, isBlocked: boolean): Promise<any>;
  }
  