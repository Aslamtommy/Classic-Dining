import { IAdminService } from "../interfaces/admin/adminServiceInterface";
import { IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import { UserRepositoryInterface } from "../interfaces/user/UserRepositoryInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { IAdminRepository } from "../interfaces/admin/adminRepositoryInterface";
import { AppError } from '../utils/AppError';
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { IAdmin } from "../models/Admin/adminModel";
import { IRestaurent } from "../models/Restaurent/restaurentModel";
import { IUser } from "../models/User/userModel";
 

export class AdminService implements IAdminService {
  constructor(
    private _adminRepository: IAdminRepository,
    private _restaurentRepository: IRestaurentRepository,
    private _userRepository: UserRepositoryInterface
  ) {}

  async adminLogin(email: string, password: string): Promise<{ admin: IAdmin; accessToken: string; refreshToken: string }> {
    try {
      const admin = await this._adminRepository.findByEmail(email);
      if (!admin) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
 
       
      if (password !==admin.password) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.INVALID_PASSWORD);
      }

      const accessToken = generateAccessToken({ id: admin._id.toString(), role: "admin" });
      const refreshToken = generateRefreshToken({ id: admin._id.toString(), role: "admin" });
      return { admin, accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
      }
      const newAccessToken = generateAccessToken({ id: (decoded as { id: string }).id, role: "admin" });
      return { accessToken: newAccessToken };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.REFRESH_TOKEN_FAILED);
    }
  }

  async getPendingRestaurents(
    page: number,
    limit: number,
    searchTerm: string
  ): Promise<{ restaurents: IRestaurent[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const filter = { 
        isApproved: false,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      const [restaurents, total] = await Promise.all([
        this._restaurentRepository.findAllPending(filter, skip, limit),
        this._restaurentRepository.countAllPending(filter),
      ]);
      return { restaurents, total };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to fetch pending restaurants");
    }
  }

  async updateRestaurentStatus(restaurentId: string, isBlocked: boolean,isApproved:boolean, blockReason?: string): Promise<IRestaurent> {
    try {
      const updated = await this._restaurentRepository.updateRestaurentStatus(restaurentId, isBlocked,isApproved, blockReason);
      if (!updated) {
        throw new AppError(HttpStatus.NotFound, "Restaurant not found");
      }
      return updated;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to update restaurant status");
    }
  }

  async getAllRestaurents(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ restaurents: IRestaurent[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const filter: Record<string, any> = {};
      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      if (isBlocked === 'blocked') filter.isBlocked = true;
      else if (isBlocked === 'active') filter.isBlocked = false;

      const [restaurents, total] = await Promise.all([
        this._restaurentRepository.findAll(filter, skip, limit),
        this._restaurentRepository.countAll(filter),
      ]);
      return { restaurents, total };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to fetch restaurants");
    }
  }

  async getAllUsers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ users: IUser[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const filter: Record<string, any> = {};
      if (searchTerm) {
        const trimmedSearchTerm = searchTerm.trim().toLowerCase();
        if (trimmedSearchTerm) {
          filter.$or = [
            { name: { $regex: trimmedSearchTerm, $options: 'i' } },
            { email: { $regex: trimmedSearchTerm, $options: 'i' } }
          ];
        }
      }
      if (isBlocked === 'blocked') filter.isBlocked = true;
      else if (isBlocked === 'active') filter.isBlocked = false;

      const [users, total] = await Promise.all([
        this._userRepository.findAll(filter, skip, limit),
        this._userRepository.countAll(filter),
      ]);
      return { users, total };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to fetch users");
    }
  }

  async restaurentBlock(restaurentId: string, isBlocked: boolean): Promise<IRestaurent> {
    try {
      const restaurent = await this._restaurentRepository.findById(restaurentId);
      if (!restaurent) {
        throw new AppError(HttpStatus.NotFound, "Restaurant not found");
      }
      restaurent.isBlocked = isBlocked;
      return await this._restaurentRepository.save(restaurent);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to block/unblock restaurant");
    }
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<IUser> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      user.isBlocked = isBlocked;
      return await this._userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to block/unblock user");
    }
  }
}

export default AdminService;