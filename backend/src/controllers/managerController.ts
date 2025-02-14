// src/controllers/ManagerController.ts
import { Request, Response } from 'express';
import { CloudinaryService } from '../utils/cloudinary.service';
import { CookieManager } from '../utils/cookiemanager';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
 

export class ManagerController {
  constructor(private managerService: any) {}

  async registerManager(req: Request, res: Response): Promise<void> {
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
        'manager_certificates',
        `manager_${email}`
      );

      // Register manager
      const manager = await this.managerService.registerManager({
        name,
        email,
        password,
        phone,
        certificate: certificatePath,
      });

      sendResponse(res, HttpStatus.Created, MessageConstants.USER_REGISTER_SUCCESS, manager);
    } catch (error: any) {
      if (error.message === MessageConstants.USER_ALREADY_EXISTS) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.USER_ALREADY_EXISTS);
      } else {
        sendError(res, HttpStatus.BadRequest, error.message);
      }
    }
  }

// In managerController.ts
public async loginManager(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await this.managerService.loginManager(email, password);
    
    CookieManager.setAuthCookies(res, result);
    sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, result.manager);
  } catch (error: any) {
    let status = HttpStatus.InternalServerError;
    let message = 'Login failed';

    try {
      const errorData = JSON.parse(error.message);
      if (errorData.code === MessageConstants.MANAGER_BLOCKED) {
        status = HttpStatus.Forbidden;
        message = `${errorData.message}: ${errorData.reason}`;
      }
    } catch {
      if (error.message === MessageConstants.LOGIN_FAILED) {
        status = HttpStatus.Unauthorized;
        message = MessageConstants.LOGIN_FAILED;
      }
    }

    sendError(res, status, message);
  }
}

  public async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const managerId = req.params.id;
      const profile = await this.managerService.getManagerProfile(managerId);

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
      const tokens = await this.managerService.refreshAccessToken(refreshToken);
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

      const response = await this.managerService.forgotPasswordVerify(email);
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
      if (!email || !password) {
        sendError(res, HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
        return;
      }

      const response = await this.managerService.resetPassword(email, password);
      if (response.success) {
        sendResponse(res, HttpStatus.OK, MessageConstants.PASSWORD_RESET_SUCCESS);
      } else {
        sendError(res, HttpStatus.BadRequest, response.message);
      }
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}