// src/services/ManagerService.ts
import { IManagerService, ILoginResponse, IForgotPasswordResponse, IResetPasswordResponse } from "../interfaces/manager/ManagerServiceInterface";
import IOtpRepository from "../interfaces/otp/OtpRepositoryInterface";
import bcrypt from "bcrypt";
import { IManager } from "../models/Manager/managerModel";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { generateOtp, hashOtp } from "../utils/GenerateOtp";
import { sentMail } from "../utils/SendMails";
import { IManagerRepository } from "../interfaces/manager/ManagerRepositoryInterface";
import { MessageConstants } from "../constants/MessageConstants";

export class ManagerService implements IManagerService {
  constructor(
    private managerRepository: IManagerRepository,
    private otpRepository: IOtpRepository
  ) {}

  async registerManager(managerData: Partial<IManager>): Promise<IManager> {
    const { name, email, password, phone, certificate } = managerData;

    // Validate required fields
    if (!name || !email || !password || !phone || !certificate) {
      throw new Error(MessageConstants.FILE_NOT_UPLOADED);
    }

    // Check for existing manager
    const existingManager = await this.managerRepository.findByEmail(email);
    if (existingManager) {
      throw new Error(MessageConstants.USER_ALREADY_EXISTS);
    }

    // Hash password and create manager
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.managerRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      certificate,
      isBlocked: true,
    });
  }

  async loginManager(email: string, password: string): Promise<ILoginResponse> {
    const manager = await this.managerRepository.findByEmail(email);
    if (!manager) throw new Error(MessageConstants.INVALID_CREDENTIALS);
    if (manager.isBlocked) throw new Error(MessageConstants.ACCESS_DENIED);

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) throw new Error(MessageConstants.INVALID_CREDENTIALS);

    // Generate tokens
    return {
      manager,
      accessToken: generateAccessToken(manager._id.toString(), "manager"),
      refreshToken: generateRefreshToken(manager._id.toString(), "manager"),
    };
  }

  async getManagerProfile(managerId: string): Promise<IManager | null> {
    return this.managerRepository.findById(managerId);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== "object") {
      throw new Error(MessageConstants.INVALID_REFRESH_TOKEN);
    }
    return { accessToken: generateAccessToken(decoded.id, "manager") };
  }

  async forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse> {
    const userData = await this.managerRepository.findByEmail(email);
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

    if (mailSent) {
      const hashedOtp = await hashOtp(otp);
      await this.otpRepository.storeOtp(hashedOtp, userData.email);
    }

    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS, data: userData.email };
  }

  async resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse> {
    const user = await this.managerRepository.findByEmail(email);
    if (!user) return { success: false, message: MessageConstants.USER_NOT_FOUND };

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.managerRepository.updatePassword(user.id, hashedPassword);
    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
  }
}