import { Request, Response } from "express";
import admin from "../config/Firebase/firebase";
import { googleUserData } from "../types/google";
import { HttpStatus } from "../constants/HttpStatus";
import { CookieManager } from "../utils/cookiemanager";
import { IUserService } from "../interfaces/user/UserServiceInterface";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils"; // Import utility functions
import { BranchRepository } from "../repositories/BranchRepository";
import { CoupenService } from "../services/CouponService";
declare global {
  namespace Express {
    export interface Request {
      data?: {
        id: string;
        role: string;
        userId?: string;
      };
    }
  }
}

export class Usercontroller {
  constructor(private userService: IUserService,private branchRepository: BranchRepository,private couponService: CoupenService ) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, mobile } = req.body;
      const newUser = await this.userService.registerUser(
        name,
        email,
        password,
        mobile
      );

      const responseData = {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile_no: newUser.mobile,
        },
      };
      sendResponse(res, HttpStatus.Created, MessageConstants.USER_REGISTER_SUCCESS, responseData);
    } catch (error: any) {
      if (error.message === "User with this email already exists.") {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ALREADY_EXISTS, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
      }
    }
  }

  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.userService.authenticateUser(email, password);
  
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });
  
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        user: { id: user._id, name: user.name, email: user.email ,mobile:user.mobile}
      });
    } catch (error: any) {
      switch (error.message) {
        case MessageConstants.USER_NOT_FOUND:
          sendError(res, HttpStatus.NotFound, error.message);
          break;
        case MessageConstants.INVALID_PASSWORD: 
          sendError(res, HttpStatus.Unauthorized, error.message);
          break;
        default:
          sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async googleSignIn(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.ID_TOKEN_REQUIRED);
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userData: googleUserData = {
        uid: decodedToken.uid,
        email: decodedToken.email!,
        email_verified: decodedToken.email_verified!,
        name: decodedToken.name || "Unknown",
      };

      const { user, accessToken, refreshToken } =
        await this.userService.googleSignIn(userData);
      CookieManager.setAuthCookies(res, { accessToken, refreshToken });

      const responseData = {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      };
      sendResponse(res, HttpStatus.OK, MessageConstants.GOOGLE_SIGNIN_SUCCESS, responseData);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.GOOGLE_SIGNIN_FAILED, error.message);
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const  refreshToken  = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.REFRESH_TOKEN_REQUIRED);
        return;
      }

      const tokens = await this.userService.refreshAccessToken(refreshToken);
      if (!tokens?.accessToken) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
        return;
      }

      res.cookie(
        "accessToken",
        tokens.accessToken,
        CookieManager.getCookieOptions()
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, {
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INVALID_REFRESH_TOKEN, error.message);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?. id;
      if (!userId) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }

      const userProfile = await this.userService.getUserProfile(userId);
      if (!userProfile) {
        sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_FETCHED_SUCCESS, userProfile);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
        return;
      }

      const serviceResponse = await this.userService.forgotPasswordVerify(email);
      if (serviceResponse.success) {
        sendResponse(res, HttpStatus.OK, serviceResponse.message, serviceResponse.data);
      } else {
        sendError(res, HttpStatus.BadRequest, serviceResponse.message, serviceResponse.error);
      }
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.userService.resetPassword(email, password);
  
      if (!result.success) {
        sendError(res, HttpStatus.BadRequest , result.message, result.message);
        return;
      }
      
      sendResponse(res, HttpStatus.OK, MessageConstants.PASSWORD_RESET_SUCCESS);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }
  
  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id
      if (!userId) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }

      if (!req.file?.path) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.FILE_NOT_UPLOADED);
        return;
      }

      const result = await this.userService.uploadProfilePicture(userId, req.file.path);
      if (result.success) {
        sendResponse(res, HttpStatus.OK, result.message, {
          profilePicture: result.profilePicture,
        });
      } else {
        sendError(res, HttpStatus.BadRequest, result.message, "Failed to upload profile picture");
      }
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      CookieManager.clearAuthCookies(res);
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id; // Extracted from authentication middleware
      if (!userId) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }

      const { name, email, mobile} = req.body;
 

     

      // Update the profile
      const updatedUser = await this.userService.updateUserProfile(userId, {
        name,
        email,
        mobile,
      });

      if (!updatedUser) {
        sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_UPDATED_SUCCESS, updatedUser);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }
  
  async getAllBranches(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10; // Accept limit from frontend
      const result = await this.userService.getAllBranches(search, page, limit);
      sendResponse(res, HttpStatus.OK, "Branches fetched successfully", result);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, "Failed to fetch branches", error.message);
    }
  }

  async getBranchDetails(req: Request, res: Response) {
    try {
      const {branchId} = req.params 
    
      const branch = await this.userService.getBranchDetails(branchId);
      if (!branch) {
        return sendError(res, HttpStatus.NotFound, 'Branch not found');
      }
      sendResponse(res, HttpStatus.OK, 'Branch details fetched successfully', branch);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async getAvailableCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await this.couponService.getAvailableCoupons();
      sendResponse(res, HttpStatus.OK, 'Available coupons retrieved successfully', coupons);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }


  

}