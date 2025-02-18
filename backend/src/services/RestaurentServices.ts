 
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
    private otpRepository: IOtpRepository,
    private branchService:any,
    private branchRepository:any
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
    console.log("Attempting login for email:", email);
  
    // Check in restaurants first
    let user = await this.restaurentRepository.findByEmail(email);
    let role = "restaurent";
  
    // If not found in restaurants, check in branches
    if (!user) {
      user = await this.branchRepository.findByEmail(email);
      role = "branch";
      if (!user) {
        console.error("User not found in branchService either");
        throw new Error(MessageConstants.LOGIN_FAILED);
      }
    }
  
    // Handle blocked account
    if (user.isBlocked) {
      console.log("Blocked user detected:", user.email);
      throw new Error(
        JSON.stringify({
          code: MessageConstants.RESTAURENT_BLOCKED,
          message: "Account Blocked",
          reason: user.blockReason || undefined,
        })
      );
    }
  
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password provided for user:", email);
      throw new Error(MessageConstants.INVALID_PASSWORD);
    }
  
    // Generate tokens
    const tokenPayload: any = {
      id: user._id.toString(),
      role,
      email: user.email,
    };
  
    if (role === "branch") {
      tokenPayload.parentRestaurantId = (user as any).parentRestaurant.toString();
    }
  
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
  
    return {
      restaurent: user,
      accessToken,
      refreshToken,
      role,
    };
  }
  async getRestaurentProfile(restaurentId: string): Promise<IRestaurent | null> {
    return this.restaurentRepository.findById(restaurentId);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded: any = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== "object") {
      throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
    }
    // Pass a payload object with id and role
    return { accessToken: generateAccessToken({ id: decoded.id, role: "Restaurent" }) };
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
    console.log(`resetPassword called for email: ${email}`);
    
    const user = await this.restaurentRepository.findByEmail(email);
    if (!user) {
      console.log(`No user found for email: ${email}`);
      return { success: false, message: MessageConstants.USER_NOT_FOUND };
    }
    
    console.log('User found:', user);
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password has been hashed successfully.');
    
   
    await this.restaurentRepository.updatePassword(user._id.toString(), hashedPassword);
    console.log(`Password updated successfully for user id: ${user.id}`);
    
    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
  }
  
}