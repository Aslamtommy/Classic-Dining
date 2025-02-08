import { IManagerService, ILoginResponse,IForgotPasswordResponse,IResetPasswordResponse } from "../interfaces/manager/ManagerServiceInterface";
 import IOtpRepository from "../interfaces/otp/OtpRepositoryInterface";
import bcrypt from "bcrypt";
import { IManager } from "../models/Manager/managerModel";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { generateOtp, hashOtp } from "../utils/GenerateOtp";
import { sentMail } from "../utils/SendMails";
 import { IManagerRepository } from "../interfaces/manager/ManagerRepositoryInterface";

export class ManagerService implements IManagerService {
 

  constructor(private managerRepository:IManagerRepository,private otpRepository:IOtpRepository) {
  
  }

  async registerManager(managerData: Partial<IManager>): Promise<IManager> {
    const { name, email, password, phone, certificate } = managerData;

    if (!name || !email || !password || !phone || !certificate) {
      throw new Error("All fields, including certificate, are required.");
    }

    const existingManager = await this.managerRepository.findByEmail(email!);
    if (existingManager) {
      throw new Error("Manager with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password!, 10);

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
    if (!manager) throw new Error("Invalid email or password.");
    if (manager.isBlocked) throw new Error("Your account is not approved yet. Please contact the admin.");

    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) throw new Error("Invalid email or password.");

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
    if (!decoded || typeof decoded !== "object") throw new Error("Invalid or malformed token");

    return { accessToken: generateAccessToken(decoded.id, "manager") };
  }

  async forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse> {
    const userData = await this.managerRepository.findByEmail(email);
    if (!userData) {
      return { success: false, message: "Mail not registered", data: null };
    }

    const otp = generateOtp();
    const mailSent = await sentMail(
      email,
      "Forgot Password Verification",
      `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p><p>This code expires in <b>2 Minutes</b></p>`
    );

    if (mailSent) {
      const hashedOtp = await hashOtp(otp);
      await this.otpRepository.storeOtp(hashedOtp, userData.email);
    }

    return { success: true, message: "Mail sent successfully", data: userData.email };
  }

  async resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse> {
    const user = await this.managerRepository.findByEmail(email);
    if (!user) return { success: false, message: "User not found" };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.managerRepository.updatePassword(user.id, hashedPassword);
    return { success: true, message: "Password updated successfully" };
  }
}

 
