import { IUser } from '../models/User/userModel';
import { Signup } from '../interfaces/user/signupInterface';
import bcrypt from 'bcrypt';
import { googleUserData } from '../types/google';
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

export class UserService implements IUserService {
  constructor(
    private userRepository: UserRepositoryInterface,
    private otpRepository: OtpRepository,
    private branchRepository: IBranchRepository // Typed with interface, removed `any`
  ) {}

  async registerUser(name: string, email: string, password: string, mobile: string): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(email);
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
    return await this.userRepository.create(userData);
  }

  async authenticateUser(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    const isPassword = user.password && password ? await bcrypt.compare(password, user.password) : false;
    if (!isPassword) {
      throw new AppError(HttpStatus.Unauthorized, MessageConstants.INVALID_PASSWORD);
    }
    const accessToken = generateAccessToken({ id: user._id.toString(), role: 'user', email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id.toString(), role: 'user' });
    return { user, accessToken, refreshToken };
  }

  async googleSignIn(userData: googleUserData): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      const accessToken = generateAccessToken({ id: existingUser._id.toString(), role: 'user', email: existingUser.email });
      const refreshToken = generateRefreshToken({ id: existingUser._id.toString(), role: 'user' });
      return { user: existingUser, accessToken, refreshToken };
    }
    const newUser = await this.userRepository.create({
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
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
    }
    const userId = decoded.id;
    const role = decoded.role || 'user';
    const newAccessToken = generateAccessToken({ id: userId, role });
    return { accessToken: newAccessToken };
  }

  async forgotPasswordVerify(email: string): Promise<string> {
    const userData = await this.userRepository.findByEmail(email);
    if (!userData) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    const otp = generateOtp();
    try {
      await sentMail(
        email,
        'Forgot Password Verification',
        `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
      );

      console.log(otp)
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, "Failed to send email");
    }
    const hashedOtp = await hashOtp(otp);
    await this.otpRepository.storeOtp(hashedOtp, userData.email);
    return userData.email;
  }

  async getUserProfile(userId: string): Promise<{ id: string; name: string; email: string; mobile: string; profilePicture: string } | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    return {
      id: user._id.toString(),
      name: user.name ?? "Unknown",
      email: user.email ?? "No Email",
      mobile: user.mobile ?? "No Mobile",
      profilePicture: user.profilePicture ?? "",
    };
  }

  async uploadProfilePicture(userId: string, filePath: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `user_${userId}`,
        overwrite: true,
      });
      const updatedUser = await this.userRepository.updateProfilePicture(userId, result.secure_url);
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      return result.secure_url;
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, "Failed to upload profile picture");
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    const isSamePassword = user.password ? await bcrypt.compare(newPassword, user.password) : false;
    if (isSamePassword) {
      throw new AppError(HttpStatus.BadRequest, "New password must be different from the old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(user._id.toString(), hashedPassword);
  }

  async updateUserProfile(userId: string, updateData: { name: string; email: string; mobile: string }): Promise<any> {
    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    }
    return {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      mobile_no: updatedUser.mobile,
      profilePicture: updatedUser.profilePicture || '',
    };
  }

  async getBranchDetails(branchId: string): Promise<any> {
    const branch = await this.branchRepository.findByIdUser(branchId);
    if (!branch) {
      throw new AppError(HttpStatus.NotFound, "Branch not found");
    }
    return branch;
  }

  async getAllBranches(search: string = '', page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const branches = await this.branchRepository.searchBranches(search, skip, limit);
    const total = await this.branchRepository.countBranches(search);
    return {
      branches,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}