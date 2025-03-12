import { Request, Response } from 'express';
import { CloudinaryService } from '../utils/cloudinary.service';
import { CookieManager } from '../utils/cookiemanager';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
import { AppError } from '../utils/AppError';
import { IRestaurentService } from '../interfaces/Restaurent/RestaurentServiceInterface';

export class RestaurentController {
  constructor(private _restaurentService: IRestaurentService) {}

  async registerRestaurent(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password || !phone) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      if (!req.file) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.FILE_NOT_UPLOADED);
      }

      const certificatePath = await CloudinaryService.uploadFile(
        req.file.path,
        'restaurent_certificates',
        `restaurent_${email}`
      );

      const restaurent = await this._restaurentService.registerRestaurent({
        name,
        email,
        password,
        phone,
        certificate: certificatePath,
      });

      sendResponse(res, HttpStatus.Created, MessageConstants.USER_REGISTER_SUCCESS, restaurent);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Restaurant registration error:', error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async loginRestaurent(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      const result = await this._restaurentService.loginRestaurent(email, password);

      // If execution reaches here, login is successful (approved)
      CookieManager.setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, {
        restaurent: result.restaurent,
        role: result.role,
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Restaurant login error:', error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const restaurentId = req.params.id;

      console.log('resaurentparamsid',restaurentId)
      if (!restaurentId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const profile = await this._restaurentService.getRestaurentProfile(restaurentId);
      if (!profile) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_FETCHED_SUCCESS, profile);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Profile fetch error:', error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REFRESH_TOKEN_REQUIRED);
      }
      const tokens = await this._restaurentService.refreshAccessToken(refreshToken);
      res.cookie('accessToken', tokens.accessToken, CookieManager.getCookieOptions());
      sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, tokens);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Refresh token error:', error instanceof Error ? error.message : 'Unknown error');
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
      const response = await this._restaurentService.forgotPasswordVerify(email);
      sendResponse(res, HttpStatus.OK, response.message, response.data);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Forgot password error:', error instanceof Error ? error.message : 'Unknown error');
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
      const response = await this._restaurentService.resetPassword(email, password);
      sendResponse(res, HttpStatus.OK, response.message);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message, error.data);
      } else {
        console.error('Reset password error:', error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      CookieManager.clearAuthCookies(res);
      sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
    } catch (error: unknown) {
      console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
      sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}