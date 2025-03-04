// src/controllers/AdminController.ts
import { Request, Response } from "express";
import { IAdminService } from "../interfaces/admin/adminServiceInterface";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { CookieManager } from "../utils/cookiemanager";
import { sendResponse, sendError } from '../utils/responseUtils';
import { AppError } from '../utils/AppError';

class AdminController {
    constructor(private adminService: IAdminService) {}

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
            }
            const { admin, accessToken, refreshToken } = await this.adminService.adminLogin(email, password);
            CookieManager.setAuthCookies(res, { accessToken, refreshToken });
            sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, { admin, email });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.Unauthorized, MessageConstants.LOGIN_FAILED);
            }
        }
    }

    async getPendingRestaurent(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchTerm = req.query.searchTerm as string || '';
            
            const { restaurents, total } = await this.adminService.getPendingRestaurents(page, limit, searchTerm);
            sendResponse(res, HttpStatus.OK, "Pending restaurants retrieved successfully", { 
                restaurents, 
                total, 
                page, 
                limit 
            });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async updateRestaurentStatus(req: Request, res: Response): Promise<void> {
        try {
            const { restaurentId, isBlocked, blockReason } = req.body;
            if (!restaurentId) {
                throw new AppError(HttpStatus.BadRequest, 'Restaurant ID is required');
            }
            if (isBlocked && !blockReason) {
                throw new AppError(HttpStatus.BadRequest, 'Block reason is required when blocking');
            }
            
            const updatedRestaurent = await this.adminService.updateRestaurentStatus(restaurentId, isBlocked, blockReason);
            sendResponse(res, HttpStatus.OK, MessageConstants.RESTAURENT_STATUS_UPDATED, { updatedRestaurent });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
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
            const tokens = await this.adminService.refreshAccessToken(refreshToken);
            res.cookie("accessToken", tokens.accessToken, CookieManager.getCookieOptions());
            sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, { accessToken: tokens.accessToken });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.InternalServerError, MessageConstants.REFRESH_TOKEN_FAILED);
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

    async getAllRestaurents(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchTerm = req.query.searchTerm as string || '';
            const isBlocked = req.query.isBlocked as string || 'all';
            const { restaurents, total } = await this.adminService.getAllRestaurents(page, limit, searchTerm, isBlocked);
            sendResponse(res, HttpStatus.OK, "Restaurants retrieved successfully", { 
                restaurents, 
                total, 
                page, 
                limit 
            });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchTerm = req.query.searchTerm as string || '';
            const isBlocked = req.query.isBlocked as string || 'all';
            const { users, total } = await this.adminService.getAllUsers(page, limit, searchTerm, isBlocked);
            sendResponse(res, HttpStatus.OK, "Users retrieved successfully", { users, total, page, limit });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async blockRestaurent(req: Request, res: Response): Promise<void> {
        try {
            const { restaurentId, isBlocked } = req.body;
            if (!restaurentId) {
                throw new AppError(HttpStatus.BadRequest, 'Restaurant ID is required');
            }
            const updatedRestaurent = await this.adminService.restaurentBlock(restaurentId, isBlocked);
            const message = isBlocked ? MessageConstants.RESTAURENT_BLOCKED : MessageConstants.RESTAURENT_UNBLOCKED;
            sendResponse(res, HttpStatus.OK, message, { updatedRestaurent });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId, isBlocked } = req.body;
            if (!userId) {
                throw new AppError(HttpStatus.BadRequest, 'User ID is required');
            }
            const updatedUser = await this.adminService.blockUser(userId, isBlocked);
            const message = isBlocked ? MessageConstants.USER_BLOCKED : MessageConstants.USER_UNBLOCKED;
            sendResponse(res, HttpStatus.OK, message, { updatedUser });
        } catch (error: unknown) {
            if (error instanceof AppError) {
                sendError(res, error.status, error.message);
            } else {
                sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
            }
        }
    }
}

export default AdminController;