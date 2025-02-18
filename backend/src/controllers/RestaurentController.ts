// src/controllers/RestaurentController.ts
import { Request, Response } from 'express';
import { CloudinaryService } from '../utils/cloudinary.service';
import { CookieManager } from '../utils/cookiemanager';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
 

export class RestaurentController {
  constructor(private restaurentService: any) {}

  async registerRestaurent(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;

      // Validate certificate upload
      if (!req.file) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.FILE_NOT_UPLOADED);
        return;
      }

      // Upload certificate to Cloudinary
      const certificatePath = await CloudinaryService.uploadFile(
        req.file.path,
        'restaurent_certificates',
        `restaurent_${email}`
      );

      // Register restaurent
      const restaurent = await this.restaurentService.registerRestaurent({
        name,
        email,
        password,
        phone,
        certificate: certificatePath,
      });

      sendResponse(res, HttpStatus.Created, MessageConstants.USER_REGISTER_SUCCESS, restaurent);
    } catch (error: any) {
      if (error.message === MessageConstants.USER_ALREADY_EXISTS) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ALREADY_EXISTS);
      } else {
        sendError(res, HttpStatus.BadRequest, error.message);
      }
    }
  }

 
 // In your controller
 public async loginRestaurent(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await this.restaurentService.loginRestaurent(email, password);
    CookieManager.setAuthCookies(res, result);
    sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
      ...result.restaurent,
      role: result.role,
    });
  } catch (error: any) {
    // Handle blocked account error
    if (error.message.includes("Account Blocked")) {
      const errorData = JSON.parse(error.message);
      sendError(res, HttpStatus.Forbidden, errorData.message, {
        reason: errorData.reason, // Include block reason in response
      });
    } else {
      // Forward other errors
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }
}

  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const restaurentId = req.params.id;
      const profile = await this.restaurentService.getRestaurentProfile(restaurentId);

      if (!profile) {
        sendError(res, HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_FETCHED_SUCCESS, profile);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.REFRESH_TOKEN_REQUIRED);
        return;
      }

      // Generate new access token
      const tokens = await this.restaurentService.refreshAccessToken(refreshToken);
      res.cookie('accessToken', tokens.accessToken, CookieManager.getCookieOptions());

      sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, tokens);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.REFRESH_TOKEN_FAILED, error.message);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
        return;
      }

      const response = await this.restaurentService.forgotPasswordVerify(email);
      if (response.success) {
        sendResponse(res, HttpStatus.OK, response.message, response.data);
      } else {
        sendError(res, HttpStatus.BadRequest, response.message);
      }
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log(email,password)
      if (!email || !password) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
        return;
      }

      const response = await this.restaurentService.resetPassword(email, password);
      console.log(response)
      if (response.success) {
        sendResponse(res, HttpStatus.OK, MessageConstants.PASSWORD_RESET_SUCCESS);
      } else {
        sendError(res, HttpStatus.BadRequest, response.message);
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
}