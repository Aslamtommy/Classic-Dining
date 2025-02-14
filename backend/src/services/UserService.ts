import { IUser } from '../models/User/userModel';
import { Signup } from '../interfaces/user/signupInterface';
import bcrypt from 'bcrypt';
import { googleUserData } from '../types/google';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/jwt';
import { generateOtp, hashOtp } from '../utils/GenerateOtp';
import { sentMail } from '../utils/SendMails';
import { IUserService } from '../interfaces/user/UserServiceInterface';
import { UserRepositoryInterface } from '../interfaces/user/UserRepositoryInterface';
import { OtpRepository } from '../repositories/otpRepository';
import cloudinary from "../config/cloudinary";
import { MessageConstants } from '../constants/MessageConstants';

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: string | null;
  error?: string;
}

export class UserService implements IUserService {
  constructor(
    private userRepository: UserRepositoryInterface,
    private otpRepository: OtpRepository
  ) {}

  // Register a new user
  async registerUser(
    name: string,
    email: string,
    password: string,
    mobile_no: string,
  ): Promise<IUser> {
    console.log('Register: Checking if user exists for email:', email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      console.log('Register: User already exists for email:', email);
      throw new Error(MessageConstants.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Register: Hashed password generated for user.');

    const userData: Signup = {
      name,
      email,
      password: hashedPassword,
      mobile_no,
      is_verified: false,
      isBlocked: false,
    };

    console.log('Register: Creating new user with data:', userData);
    return await this.userRepository.create(userData);
  }

  // Authenticate user
  async authenticateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      console.log('Login: User not found for email:', email);
      throw new Error(MessageConstants.USER_NOT_FOUND);
    }

    const isPassword =
      user.password && password
        ? await bcrypt.compare(password, user.password)
        : false;

    if (!isPassword) {
      console.log('Login: Invalid password for email:', email);
      throw new Error(MessageConstants.INVALID_CREDENTIALS);
    }

    const accessToken = generateAccessToken(user._id.toString(), 'user');
    const refreshToken = generateRefreshToken(user._id.toString(), 'user');

    return { user, accessToken, refreshToken };
  }

  // Google Sign-In
  async googleSignIn(
    userData: googleUserData,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    console.log(
      'Google Sign-In: Checking for existing user with email:',
      userData.email,
    );

    const existingUser = await this.userRepository.findByEmail(userData.email);

    if (existingUser) {
      console.log('Google Sign-In: Existing user found, generating tokens');

      const accessToken = generateAccessToken(existingUser._id.toString(), 'user');
      const refreshToken = generateRefreshToken(existingUser._id.toString(), 'user');

      return { user: existingUser, accessToken, refreshToken };
    }

    console.log('Google Sign-In: No existing user found, creating new user');

    const newUser = await this.userRepository.create({
      email: userData.email,
      name: userData.name || 'Unknown',
      mobile_no: '',
      google_id: userData.uid,
      is_verified: true,
    });

    console.log('Google Sign-In: New user created:', newUser);

    const accessToken = generateAccessToken(newUser._id.toString(), 'user');
    const refreshToken = generateRefreshToken(newUser._id.toString(), 'user');

    return { user: newUser, accessToken, refreshToken };
  }

  // Refresh Access Token
  async refreshAccessToken(refreshToken: string) {
    try {
      console.log('Verifying refresh token:', refreshToken);

      const decoded = verifyToken(refreshToken);

      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        console.warn('Invalid or malformed token during verification:', decoded);
        throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
      }

      console.log('Refresh token verified. Decoded payload:', decoded);

      const userId = decoded.id;
      const role = decoded.role;

      console.log('Generating new access token for user ID:', userId, 'Role:', role);
      const newAccessToken = generateAccessToken(userId, role);

      return { accessToken: newAccessToken };
    } catch (error: any) {
      console.error('Refresh Token: Error verifying token:', error.message);
      throw new Error(MessageConstants.REFRESH_TOKEN_FAILED);
    }
  }

  async forgotPasswordVerify(email: string): Promise<ForgotPasswordResponse> {
    try {
      const userData = await this.userRepository.findByEmail(email);
      if (!userData) {
        return {
          success: false,
          message: MessageConstants.USER_NOT_FOUND,
          data: null,
        };
      }
      const otp = generateOtp();

      const mail = await sentMail(
        email,
        'Forgot Password Verification',
        `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`,
      );
      console.log('oTp', otp);
      if (mail) {
        const hashedOtp = await hashOtp(otp);
        const otpStatus = await this.otpRepository.storeOtp(
          hashedOtp,
          userData.email,
        );
      }

      return {
        success: true,
        message: MessageConstants.PASSWORD_RESET_SUCCESS,
        data: userData.email,
      };
    } catch (error: any) {
      console.log(error.message);
      return { success: false, message: MessageConstants.INTERNAL_SERVER_ERROR, data: null };
    }
  }

  public async getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    mobile_no: string;
    profilePicture: string;
  } | null> {
    console.log("UserService: Fetching profile for userId:", userId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      console.log("UserService: User not found");
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name ?? "Unknown",
      email: user.email ?? "No Email",
      mobile_no: user.mobile_no ?? "No Mobile",
      profilePicture: user.profilePicture ?? "",
    };
  }

  async uploadProfilePicture(userId: string, filePath: string): Promise<{ success: boolean; message: string; profilePicture?: string }> {
    try {
      console.log("Uploading file to Cloudinary...");
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `user_${userId}`,
        overwrite: true,
      });

      console.log("File uploaded to Cloudinary:", result.secure_url);

      const updatedUser = await this.userRepository.updateProfilePicture(userId, result.secure_url);

      if (!updatedUser) {
        return { success: false, message: MessageConstants.USER_NOT_FOUND };
      }

      return {
        success: true,
        message: MessageConstants.PROFILE_FETCHED_SUCCESS,
        profilePicture: updatedUser.profilePicture,
      };
    } catch (error: any) {
      console.error("Error in uploadProfilePicture method:", error.message);
      return { success: false, message: MessageConstants.INTERNAL_SERVER_ERROR };
    }
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    console.log(`resetPassword called with email: ${email}`);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      console.log(`No user found with email: ${email}`);
      return { success: false, message: MessageConstants.USER_NOT_FOUND };
    }

    console.log(`User found: ${user.email}. Proceeding to hash the new password.`);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Password hashed successfully for email: ${email}`);

    try {
      await this.userRepository.updatePassword(user.id, hashedPassword);
      console.log(`Password updated successfully for email: ${email}`);
      return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
    } catch (error) {
      console.error(`Error updating password for email: ${email}`, error);
      return { success: false, message: MessageConstants.INTERNAL_SERVER_ERROR };
    }
  }

  public async updateUserProfile(
    userId: string,
    updateData: { name: string; email: string; mobile_no: string }
  ): Promise<any> {
    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) return null;

    return {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      mobile_no: updatedUser.mobile_no,
      profilePicture: updatedUser.profilePicture || '',
    };
  }

}