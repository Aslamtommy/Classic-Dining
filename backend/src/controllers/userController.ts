import { Request, Response } from "express";
import admin from "../config/Firebase/firebase";
import { googleUserData } from "../types/google";
import { HttpStatus } from "../constants/HttpStatus";
import { CookieManager } from "../utils/cookiemanager";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils";
import { ICouponService } from "../interfaces/coupon/ICouponService";
import { IUserService } from "../interfaces/user/UserServiceInterface";
import { INotificationService } from '../services/NotificationService';
import { AppError } from '../utils/AppError';

export class Usercontroller {
  constructor(
    private _userService: IUserService,
    private _couponService: ICouponService,
    private _notificationService: INotificationService
  ) {}


  async registerUser(req: Request, res: Response): Promise<void> {
    
    try {
      const { name, email, password, mobile } = req.body;
      if (!name || !email || !password || !mobile) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const newUser = await this._userService.registerUser(name, email, password, mobile);
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
      const { user, accessToken, refreshToken } = await this._userService.authenticateUser(email, password);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
        accessToken,
        refreshToken
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
      const { user, accessToken, refreshToken } = await this._userService.googleSignIn(userData);
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
      const tokens = await this._userService.refreshAccessToken(refreshToken);
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
      const userProfile = await this._userService.getUserProfile(userId);
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
      const emailSent = await this._userService.forgotPasswordVerify(email);
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
      await this._userService.resetPassword(email, password);
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
      const profilePicture = await this._userService.uploadProfilePicture(userId, req.file.path);
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
      const updatedUser = await this._userService.updateUserProfile(userId, { name, email, mobile });
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

 // src/controllers/UserController.ts
async getAllBranches(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      page,
      limit,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      sortOrder,
    } = req.query;
    const options = {
      search: search as string || "",
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    };
    const result = await this._userService.getAllBranches(
      options.search,
      options.page,
      options.limit,
      options.minPrice,
      options.maxPrice,
      options.minRating,
      options.sortBy,
      options.sortOrder
    );
    sendResponse(res, HttpStatus.OK, "Branches fetched successfully", result);
  } catch (error) {
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
      const branch = await this._userService.getBranchDetails(branchId);
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
      const coupons = await this._couponService.getAvailableCoupons();
      sendResponse(res, HttpStatus.OK, "Available coupons retrieved successfully", coupons);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.data!;
      const { page = '1', limit = '10' } = req.query;
      const { notifications, total } = await this._notificationService.getNotifications(
        'user',
        id,
        parseInt(page as string),
        parseInt(limit as string)
      );
      sendResponse(res, HttpStatus.OK, 'Notifications fetched successfully', {
        notifications,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error fetching notifications:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      if (!notificationId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const notification = await this._notificationService.markNotificationAsRead(notificationId);
      sendResponse(res, HttpStatus.OK, 'Notification marked as read', notification);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error('Error marking notification as read:', error);
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}