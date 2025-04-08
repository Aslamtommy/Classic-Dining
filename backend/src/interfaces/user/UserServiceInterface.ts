// src/interfaces/user/UserServiceInterface.ts
import { IUser } from '../../models/User/userModel';
import { googleUserData } from '../../types/google';
import { IBranch } from '../../models/Restaurent/Branch/BranchModel'; // Assuming this is your branch model

export interface IUserService {
  registerUser(
    name: string,
    email: string,
    password: string,
    mobile: string // Changed from mobile_no to match typical naming
  ): Promise<IUser>;

  authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

  googleSignIn(
    userData: googleUserData
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

  forgotPasswordVerify(email: string): Promise<string>;

  resetPassword(
    email: string,
    newPassword: string
  ): Promise<void>;

  getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    profilePicture: string;
  } | null>;

  uploadProfilePicture(userId: string, filePath: string): Promise<string>;

  updateUserProfile(
    userId: string,
    updateData: { name: string; email: string; mobile: string }
  ): Promise<{ id: string; name: string; email: string; mobile: string; profilePicture: string }>;

  getBranchDetails(branchId: string): Promise<IBranch | null>;

  getAllBranches(
    search: string ,
    page: number  ,
    limit: number ,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{ branches: IBranch[]; total: number; page: number; pages: number }>
}