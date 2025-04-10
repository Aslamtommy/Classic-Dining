import { IUser } from '../models/User/userModel';
import { googleUserData } from '../types/google';
import { Signup } from '../interfaces/user/signupInterface';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { generateOtp, hashOtp } from '../utils/GenerateOtp';
import { sentMail } from '../utils/SendMails';
import { IUserService } from '../interfaces/user/UserServiceInterface';
import { UserRepositoryInterface } from '../interfaces/user/UserRepositoryInterface';
import { IBranchRepository } from '../interfaces/branch/IBranchRepository';
import { OtpRepository } from '../repositories/otpRepository';
import cloudinary from "../config/cloudinary";
import { MessageConstants } from '../constants/MessageConstants';
import { HttpStatus } from '../constants/HttpStatus';
import { AppError } from '../utils/AppError';
import { IBranch } from '../models/Restaurent/Branch/BranchModel';
import { CloudinaryService } from '../utils/cloudinary.service';
export class UserService implements IUserService {
  constructor(
    private _userRepository: UserRepositoryInterface,
    private _otpRepository: OtpRepository,
    private _branchRepository: IBranchRepository
  ) {}

  async registerUser(name: string, email: string, password: string, mobile: string): Promise<IUser> {
    try {
      const existingUser = await this._userRepository.findByEmail(email);
      if (existingUser) {
        throw new AppError(HttpStatus.Conflict, MessageConstants.USER_ALREADY_EXISTS);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData: Signup = {
        name,
        email,
        password: hashedPassword,
        mobile,
        is_verified: false,
        isBlocked: false,
      };
      return await this._userRepository.create(userData);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async authenticateUser(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
      if (!isPasswordValid) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.INVALID_PASSWORD);
      }
      const accessToken = generateAccessToken({ id: user._id.toString(), role: 'user', email: user.email });
      const refreshToken = generateRefreshToken({ id: user._id.toString(), role: 'user' });
      return { user, accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async googleSignIn(userData: googleUserData): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      const existingUser = await this._userRepository.findByEmail(userData.email);
      if (existingUser) {
        const accessToken = generateAccessToken({ id: existingUser._id.toString(), role: 'user', email: existingUser.email });
        const refreshToken = generateRefreshToken({ id: existingUser._id.toString(), role: 'user' });
        return { user: existingUser, accessToken, refreshToken };
      }
      const newUser = await this._userRepository.create({
        email: userData.email,
        name: userData.name || 'Unknown',
        mobile: '',
        google_id: userData.uid,
        is_verified: true,
        isBlocked: false,
      });
      const accessToken = generateAccessToken({ id: newUser._id.toString(), role: 'user', email: newUser.email });
      const refreshToken = generateRefreshToken({ id: newUser._id.toString(), role: 'user' });
      return { user: newUser, accessToken, refreshToken };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
      }
      const newAccessToken = generateAccessToken({ id: (decoded as { id: string }).id, role: 'user' });
      return { accessToken: newAccessToken };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPasswordVerify(email: string): Promise<string> {
    try {
      const userData = await this._userRepository.findByEmail(email);
      if (!userData) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      const otp = generateOtp();
      await sentMail(
        email,
        'Forgot Password Verification',
        `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
      );


      console.log(otp)
      const hashedOtp = await hashOtp(otp);
      await this._otpRepository.storeOtp(hashedOtp, userData.email);
      return userData.email;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to send email");
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      const isSamePassword = user.password ? await bcrypt.compare(newPassword, user.password) : false;
      if (isSamePassword) {
        throw new AppError(HttpStatus.BadRequest, "New password must be different from the old password");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this._userRepository.updatePassword(user._id.toString(), hashedPassword);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserProfile(userId: string): Promise<{ id: string; name: string; email: string; mobile: string; profilePicture: string } | null> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      return {
        id: user._id.toString(),
        name: user.name ?? "Unknown",
        email: user.email ?? "No Email",
        mobile: user.mobile ?? "No Mobile", // Default value to handle undefined
        profilePicture: user.profilePicture ?? "",
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadProfilePicture(userId: string, filePath: string): Promise<string> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `user_${userId}`,
        overwrite: true,
        type: "authenticated", // Restrict access
      });
      const updatedUser = await this._userRepository.updateProfilePicture(userId, result.secure_url);
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      // Return a signed URL instead of the default secure_url
      return CloudinaryService.generateSignedUrl(`user_${userId}`);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, "Failed to upload profile picture");
    }
  }

  async updateUserProfile(
    userId: string,
    updateData: { name: string; email: string; mobile: string }
  ): Promise<{ id: string; name: string; email: string; mobile: string; profilePicture: string }> {
    try {
      const updatedUser = await this._userRepository.update(userId, updateData);
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name, // Safe because update ensures name is a string
        email: updatedUser.email, // Safe because update ensures email is a string
        mobile: updatedUser.mobile ?? '', // Default to empty string if undefined
        profilePicture: updatedUser.profilePicture || '',
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getBranchDetails(branchId: string): Promise<IBranch | null> {
    try {
      // Ensure branchId is a string and valid
      if (typeof branchId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(branchId)) {
        throw new AppError(HttpStatus.BadRequest, "Invalid branch ID format");
      }
      const branch = await this._branchRepository.findByIdUser(branchId);
      console.log('[branchservice]', branch);
      if (!branch) {
        throw new AppError(HttpStatus.NotFound, "Branch not found");
      }
      return branch;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  // src/services/UserService.ts
async getAllBranches(
  search: string = "",
  page: number = 1,
  limit: number = 10,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): Promise<{ branches: IBranch[]; total: number; page: number; pages: number }> {
  try {
    const options = { search, page, limit, minPrice, maxPrice, minRating, sortBy, sortOrder };
    const { branches, total } = await this._branchRepository.searchBranches(options);
    return {
      branches,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(HttpStatus.InternalServerError, "Failed to fetch branches");
  }
}
}