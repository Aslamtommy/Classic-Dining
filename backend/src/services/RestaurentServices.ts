import { IRestaurentService, ILoginResponse, IForgotPasswordResponse, IResetPasswordResponse } from "../interfaces/Restaurent/RestaurentServiceInterface";
import IOtpRepository from "../interfaces/otp/OtpRepositoryInterface";
import bcrypt from "bcrypt";
import { IRestaurent } from "../models/Restaurent/restaurentModel";
import { IBranch } from "../models/Restaurent/Branch/BranchModel";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { generateOtp, hashOtp } from "../utils/GenerateOtp";
import { sentMail } from "../utils/SendMails";
import { IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import { MessageConstants } from "../constants/MessageConstants";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { IBranchRepository } from "../interfaces/branch/IBranchRepository";
import { TokenPayload } from "../interfaces/Restaurent/RestaurentServiceInterface";


export class RestaurentServices implements IRestaurentService {
  constructor(
    private restaurentRepository: IRestaurentRepository,
    private otpRepository: IOtpRepository,
    private branchRepository: IBranchRepository
  ) {}

  async registerRestaurent(restaurentData: Partial<IRestaurent>): Promise<IRestaurent> {
    const { name, email, password, phone, certificate } = restaurentData;
    if (!name || !email || !password || !phone || !certificate) {
      throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
    }

    const existingRestaurent = await this.restaurentRepository.findByEmail(email);
    if (existingRestaurent) {
      throw new AppError(HttpStatus.Conflict, MessageConstants.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.restaurentRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      certificate,
      isBlocked: true,
    });
  }

  async loginRestaurent(email: string, password: string): Promise<ILoginResponse> {
    let user: IRestaurent | IBranch | null = await this.restaurentRepository.findByEmail(email);
    let role: "restaurent" | "branch" = "restaurent";

    if (!user) {
      user = await this.branchRepository.findByEmail(email);
      role = "branch";
      if (!user) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.LOGIN_FAILED);
      }
    }

    if (role === "restaurent" && (user as IRestaurent).isBlocked) {
      throw new AppError(HttpStatus.Forbidden, MessageConstants.RESTAURENT_BLOCKED, {
        reason: (user as IRestaurent).blockReason || "No reason provided",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new AppError(HttpStatus.Unauthorized, MessageConstants.INVALID_PASSWORD);
    }

    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      role,
      email: user.email,
    };

    if (role === "branch") {
      tokenPayload.parentRestaurantId = (user as IBranch).parentRestaurant.toString();
    }

    const accessToken = generateAccessToken(tokenPayload, );
    const refreshToken = generateRefreshToken(tokenPayload);
    const plainUser = user.toObject ? user.toObject() : user;
    return { restaurent: plainUser , accessToken, refreshToken, role };
  }

  async getRestaurentProfile(restaurentId: string): Promise<IRestaurent | null> {

    console.log('restaureniit',restaurentId)
    const restaurent = await this.restaurentRepository.findById(restaurentId);
    if (!restaurent) {
      throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
    }
    return restaurent;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyToken(refreshToken);
    if (!decoded || typeof decoded !== "object" || !('id' in decoded)) {
      throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
    }
    const tokenPayload: { id: string; role: string } = {
      id: (decoded as { id: string }).id,
      role: "restaurent",
    };
    return { accessToken: generateAccessToken(tokenPayload) };
  }

  async forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse> {
    const userData = await this.restaurentRepository.findByEmail(email);
    if (!userData) {
      return { success: false, message: MessageConstants.USER_NOT_FOUND, data: null };
    }

    const otp = generateOtp();
    const mailSent = await sentMail(
      email,
      "Forgot Password Verification",
      `<p>Enter this code <b>${otp}</b> to verify your email for resetting the password.</p>`
    );

    if (!mailSent) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.OTP_SENT_FAILED);
    }
console.log(otp)
    const hashedOtp = await hashOtp(otp);
    await this.otpRepository.storeOtp(hashedOtp, userData.email);

    return { success: true, message: MessageConstants.OTP_SENT, data: userData.email };
  }

  async resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse> {
    const user = await this.restaurentRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: MessageConstants.USER_NOT_FOUND };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.restaurentRepository.updatePassword(user._id.toString(), hashedPassword);

    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
  }
}