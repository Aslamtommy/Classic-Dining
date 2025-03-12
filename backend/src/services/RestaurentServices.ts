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
    private _restaurentRepository: IRestaurentRepository,
    private _otpRepository: IOtpRepository,
    private _branchRepository: IBranchRepository
  ) {}

  async registerRestaurent(restaurentData: Partial<IRestaurent>): Promise<IRestaurent> {
    const { name, email, password, phone, certificate } = restaurentData;
    if (!name || !email || !password || !phone || !certificate) {
      throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
    }

    const existingRestaurent = await this._restaurentRepository.findByEmail(email);
    if (existingRestaurent) {
      throw new AppError(HttpStatus.Conflict, MessageConstants.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await this._restaurentRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      certificate,
      isBlocked: false, // Default to false for new accounts
      isApproved: false,
    });
  }

  async loginRestaurent(email: string, password: string): Promise<ILoginResponse> {
    let user: IRestaurent | IBranch | null = await this._restaurentRepository.findByEmail(email);
    let role: "restaurent" | "branch" = "restaurent";

    if (!user) {
      user = await this._branchRepository.findByEmail(email);
      role = "branch";
      if (!user) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.LOGIN_FAILED);
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new AppError(HttpStatus.Unauthorized, MessageConstants.INVALID_PASSWORD);
    }

    if (role === "restaurent") {
      const restaurent = user as IRestaurent;
      if (restaurent.isBlocked) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.RESTAURENT_BLOCKED, {
          reason: restaurent.blockReason || "No reason provided",
          status: "blocked",
        });
      }
      if (!restaurent.isApproved) {
        throw new AppError(HttpStatus.Accepted, 'Approval pending', { status: 'pending' });
      }
    }

    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      role,
      email: user.email,
    };

    if (role === "branch") {
      tokenPayload.parentRestaurantId = (user as IBranch).parentRestaurant.toString();
    }

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const plainUser = user.toObject ? user.toObject() : user;
    return { restaurent: plainUser, accessToken, refreshToken, role, status: "approved" };
  }

  async getRestaurentProfile(restaurentId: string): Promise<IRestaurent | null> {

    console.log('restaureniit',restaurentId)
    const restaurent = await this._restaurentRepository.findById(restaurentId);
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
    const userData = await this._restaurentRepository.findByEmail(email);
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
    await this._otpRepository.storeOtp(hashedOtp, userData.email);

    return { success: true, message: MessageConstants.OTP_SENT, data: userData.email };
  }

  async resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse> {
    const user = await this._restaurentRepository.findByEmail(email);
    if (!user) {
      return { success: false, message: MessageConstants.USER_NOT_FOUND };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this._restaurentRepository.updatePassword(user._id.toString(), hashedPassword);

    return { success: true, message: MessageConstants.PASSWORD_RESET_SUCCESS };
  }
}