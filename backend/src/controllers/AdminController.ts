import { Request, Response } from "express";
import { IAdminService } from "../interfaces/admin/adminServiceInterface";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { CookieManager } from "../utils/cookiemanager";
import { sendResponse, sendError } from '../utils/responseUtils' 

class AdminController {
    constructor(private adminService: IAdminService) {}

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const { admin, accessToken, refreshToken } = await this.adminService.adminLogin(email, password);
            CookieManager.setAuthCookies(res, { accessToken, refreshToken });
            sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, { admin, email });
        } catch (error: any) {
            sendError(res, HttpStatus.Unauthorized,  MessageConstants.LOGIN_FAILED || error.message );
        }
    }

    async getPendingManagers(req: Request, res: Response): Promise<void> {
        try {
            const pendingManagers = await this.adminService.getPendingManagers();
            sendResponse(res, HttpStatus.OK, "Pending managers retrieved successfully", { managers: pendingManagers });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async updateManagerStatus(req: Request, res: Response): Promise<void> {
        const { managerId, isBlocked } = req.body;
        try {
            const updatedManager = await this.adminService.updateManagerStatus(managerId, isBlocked);
            sendResponse(res, HttpStatus.OK, MessageConstants.MANAGER_STATUS_UPDATED, { updatedManager });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshAccessToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                sendError(res, HttpStatus.BadRequest, MessageConstants.REFRESH_TOKEN_REQUIRED);
                return;
            }
            const tokens = await this.adminService.refreshAccessToken(refreshToken);
            if (!tokens?.accessToken) {
                sendError(res, HttpStatus.BadRequest, MessageConstants.INVALID_REFRESH_TOKEN);
                return;
            }
            res.cookie("accessToken", tokens.accessToken, CookieManager.getCookieOptions());
            sendResponse(res, HttpStatus.OK, MessageConstants.ACCESS_TOKEN_REFRESHED, { accessToken: tokens.accessToken });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.REFRESH_TOKEN_FAILED);
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            CookieManager.clearAuthCookies(res);
            sendResponse(res, HttpStatus.OK, MessageConstants.LOGOUT_SUCCESS);
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllManagers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { managers, total } = await this.adminService.getAllManagers(page, limit);
            sendResponse(res, HttpStatus.OK, "Managers retrieved successfully", { managers, total, page, limit });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { users, total } = await this.adminService.getAllUsers(page, limit);
            sendResponse(res, HttpStatus.OK, "Users retrieved successfully", { users, total, page, limit });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async blockManager(req: Request, res: Response): Promise<void> {
        const { managerId, isBlocked } = req.body;
        try {
            const updatedManager = await this.adminService.managerBlock(managerId, isBlocked);
            const message = isBlocked ? MessageConstants.MANAGER_BLOCKED : MessageConstants.MANAGER_UNBLOCKED;
            sendResponse(res, HttpStatus.OK, message, { updatedManager });
        } catch (error: any) {
            sendError(res, HttpStatus.BadRequest, error.message);
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        const { userId, isBlocked } = req.body;
        try {
            const updatedUser = await this.adminService.blockUser(userId, isBlocked);
            const message = isBlocked ? MessageConstants.USER_BLOCKED : MessageConstants.USER_UNBLOCKED;
            sendResponse(res, HttpStatus.OK, message, { updatedUser });
        } catch (error: any) {
            sendError(res, HttpStatus.BadRequest, error.message);
        }
    }
}

export default AdminController;