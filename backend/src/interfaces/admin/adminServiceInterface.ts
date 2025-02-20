export interface IAdminService {
  adminLogin(email: string, password: string): Promise<{ admin: any; accessToken: string; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  getPendingRestaurents( page: number,
    limit: number,
    searchTerm: string): Promise<{ restaurents: any[]; total: number }>;
  updateRestaurentStatus(restaurentId: string, isBlocked: boolean,  blockReason?: string) : Promise<any>;
 
  getAllRestaurents(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ restaurents: any[]; total: number }>;
  getAllUsers( page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string): Promise<{ users: any[]; total: number }>;
   restaurentBlock(restaurentId: string, isBlocked: boolean): Promise<any>;
  blockUser(userId: string, isBlocked: boolean): Promise<any>;
}
 