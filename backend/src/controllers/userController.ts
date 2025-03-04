import { Request, Response } from "express";
import admin from "../config/Firebase/firebase";
import { googleUserData } from "../types/google";
import { HttpStatus } from "../constants/HttpStatus";
import { CookieManager } from "../utils/cookiemanager";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils";
import { ICouponService } from "../interfaces/coupon/ICouponService";
import { IUserService } from "../interfaces/user/UserServiceInterface";
import { AppError } from "../utils/AppError";

export class Usercontroller {
  constructor(
    private userService: IUserService,
    private couponService: ICouponService
  ) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, mobile } = req.body;
      if (!name || !email || !password || !mobile) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const newUser = await this.userService.registerUser(name, email, password, mobile);
      const responseData = {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile_no: newUser.mobile,
        },
      };
      sendResponse(res, HttpStatus.Created, MessageConstants.USER_REGISTER_SUCCESS, responseData);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const { user, accessToken, refreshToken } = await this.userService.authenticateUser(email, password);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.ID_TOKEN_REQUIRED);
      }
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userData: googleUserData = {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        email_verified: decodedToken.email_verified!,
        name: decodedToken.name || "Unknown",
      };
      const { user, accessToken, refreshToken } = await this.userService.googleSignIn(userData);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      const responseData = {
        user: { id: user._id, name: user.name, email: user.email },
      };
      sendResponse(res, HttpStatus.OK, MessageConstants.GOOGLE_SIGNIN_SUCCESS, responseData);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.GOOGLE_SIGNIN_FAILED);
      }
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REFRESH_TOKEN_REQUIRED);
      }
      const tokens = await this.userService.refreshAccessToken(refreshToken);
      res.cookie("accessToken", tokens.accessToken, CookieManager.getCookieOptions());
      sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, {
        accessToken: tokens.accessToken,
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INVALID_REFRESH_TOKEN);
      }
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
      }
      const userProfile = await this.userService.getUserProfile(userId);
      if (!userProfile) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_FETCHED_SUCCESS, userProfile);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
      }
      const emailSent = await this.userService.forgotPasswordVerify(email);
      sendResponse(res, HttpStatus.OK, MessageConstants.PASSWORD_RESET_SUCCESS, { email: emailSent });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      await this.userService.resetPassword(email, password);
      sendResponse(res, HttpStatus.OK, MessageConstants.PASSWORD_RESET_SUCCESS);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
      }
      if (!req.file?.path) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.FILE_NOT_UPLOADED);
      }
      const profilePicture = await this.userService.uploadProfilePicture(userId, req.file.path);
      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_PICTURE_UPLOADED, { profilePicture });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      CookieManager.clearAuthCookies(res);
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
    } catch (error: unknown) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
      }
      const { name, email, mobile } = req.body;
      const updatedUser = await this.userService.updateUserProfile(userId, { name, email, mobile });
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_UPDATED_SUCCESS, updatedUser);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAllBranches(req: Request, res: Response): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.userService.getAllBranches(search, page, limit);
      sendResponse(res, HttpStatus.OK, "Branches fetched successfully", result);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, "Failed to fetch branches");
      }
    }
  }

  async getBranchDetails(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, "Branch ID is required");
      }
      const branch = await this.userService.getBranchDetails(branchId);
      if (!branch) {
        throw new AppError(HttpStatus.NotFound, "Branch not found");
      }
      sendResponse(res, HttpStatus.OK, "Branch details fetched successfully", branch);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAvailableCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await this.couponService.getAvailableCoupons();
      sendResponse(res, HttpStatus.OK, "Available coupons retrieved successfully", coupons);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}