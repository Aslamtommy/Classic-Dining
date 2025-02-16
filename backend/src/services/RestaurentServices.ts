 
import { IRestaurentService, ILoginResponse, IForgotPasswordResponse, IResetPasswordResponse } from "../interfaces/Restaurent/RestaurentServiceInterface";
import IOtpRepository from "../interfaces/otp/OtpRepositoryInterface";
import bcrypt from "bcrypt";
import { IRestaurent } from "../models/Restaurent/RestaurentModel";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { generateOtp, hashOtp } from "../utils/GenerateOtp";
import { sentMail } from "../utils/SendMails";
import {IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import { MessageConstants } from "../constants/MessageConstants";

export class  RestaurentServices implements  IRestaurentService {
  constructor(
    private restaurentRepository: IRestaurentRepository ,
    private otpRepository: IOtpRepository
  ) {}

  async registerRestaurent(restaurentData: Partial<IRestaurent>): Promise<IRestaurent> {
    const { name, email, password, phone, certificate } = restaurentData;

    // Validate required fields
    if (!name || !email || !password || !phone || !certificate) {
      throw new Error(MessageConstants.FILE_NOT_UPLOADED);
    }

    // Check for existing restaurent
    const existingRestaurent = await this.restaurentRepository.findByEmail(email);
    if (existingRestaurent) {
      throw new Error(MessageConstants.USER_ALREADY_EXISTS);
    }

    // Hash password and create restaurent
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.restaurentRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      certificate,
      isBlocked: true,
    });
  }

  // In restaurentService.ts
  async loginRestaurent(email: string, password: string): Promise<ILoginResponse> {
    const restaurent = await this.restaurentRepository.findByEmail(email);
    if (!restaurent) throw new Error(MessageConstants.LOGIN_FAILED);
  
    if (restaurent.isBlocked) {
      throw new Error(JSON.stringify({
        code: MessageConstants.RESTAURENT_BLOCKED,
        message: 'Account Not Approved',
        reason: restaurent.blockReason || 'Contact support for details'
      }));
    }
  
    const isPasswordValid = await bcrypt.compare(password,restaurent.password);
    if (!isPasswordValid) throw new Error(MessageConstants.LOGIN_FAILED);
  
    return {
      restaurent,
      accessToken: generateAccessToken(restaurent._id.toString(), "Restaurent"),
      refreshToken: generateRefreshToken(restaurent._id.toString(), "Restaurent"),
    };
  }

  async getRestaurentProfile(restaurentId: string): Promise<IRestaurent | null> {
    return this.restaurentRepository.findById(restaurentId);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== "object") {
      throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
    }
    return { accessToken: generateAccessToken(decoded.id, "Restaurent") };
  }

  async forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse> {
    const userData = await this.restaurentRepository.findByEmail(email);
    if (!userData) {
      return { success: false, message: MessageConstants.USER_NOT_FOUND, data: null };
    }

    // Generate and send OTP
    const otp = generateOtp();
    const mailSent = await sentMail(
      email,
      "Forgot Password Verification",
      `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p>`
    );
console.log('OTP',otp)
    if (mailSent) {
      const hashedOtp = await hashOtp(otp);
      await this.otpRepository.storeOtp(hashedOtp, userData.email);
    }

    return { success: true, message: MessageConstants.OTP_SENT, data: userData.email };
  }

  async resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse> {
    const user = await this.restaurentRepository.findByEmail(email);
    if (!user) return { success: false, message: MessageConstants.USER_NOT_FOUND };

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.restaurentRepository.updatePassword(user.id, hashedPassword);
    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
  }
}