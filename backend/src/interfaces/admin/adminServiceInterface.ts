import { IUser } from '../../models/User/userModel';
import { IRestaurent } from '../../models/Restaurent/restaurentModel';
import { IAdmin } from '../../models/Admin/adminModel';

export interface IAdminService {
  adminLogin(email: string, password: string): Promise<{ admin: IAdmin; accessToken: string; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  getPendingRestaurents(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ restaurents: IRestaurent[]; total: number }>;
  updateRestaurentStatus(restaurentId: string, isBlocked: boolean,isApproved:boolean, blockReason?: string): Promise<IRestaurent>;
  getAllRestaurents(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ restaurents: IRestaurent[]; total: number }>;
  getAllUsers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ users: IUser[]; total: number }>;
  restaurentBlock(restaurentId: string, isBlocked: boolean): Promise<IRestaurent>;
  blockUser(userId: string, isBlocked: boolean): Promise<IUser>;
}

