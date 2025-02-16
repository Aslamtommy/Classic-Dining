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
            CookieManager.setAuthCookies(res,{accessToken ,refreshToken})
            sendResponse(res, HttpStatus.OK, MessageConstants.LOGIN_SUCCESS, { admin, email });
        } catch (error: any) {
            sendError(res, HttpStatus.Unauthorized,  MessageConstants.LOGIN_FAILED || error.message );
        }
    }

    async getPendingRestaurent(req: Request, res: Response): Promise<void> {
        try {
            const pendingRestaurent = await this.adminService.getPendingRestaurents();
            sendResponse(res, HttpStatus.OK, "Pending restaurent retrieved successfully", { restaurents: pendingRestaurent });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

// Controller
async updateRestaurentStatus(req: Request, res: Response): Promise<void> {
    const { restaurentId, isBlocked, blockReason } = req.body; // Add blockReason
  
    // Validate block reason if blocking
    if (isBlocked && !blockReason) {
      sendError(res, HttpStatus.BadRequest, 'Block reason is required.');
      return;
    }
  
    try {
      const updatedRestaurent = await this.adminService.updateRestaurentStatus(
        restaurentId,
        isBlocked,
        blockReason // Pass blockReason to service
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.RESTAURENT_STATUS_UPDATED , { updatedRestaurent });
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

    async getAllRestaurents(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchTerm = req.query.searchTerm as string || '';
            const isBlocked = req.query.isBlocked as string || 'all';
            const { restaurents, total } = await this.adminService.getAllRestaurents(
                page,
                limit,
                searchTerm,
                isBlocked
              );


    sendResponse(res, HttpStatus.OK, "Restaurents retrieved successfully", { 
        restaurents, 
      total, 
      page, 
      limit 
    });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchTerm = req.query.searchTerm as string || '';
            const isBlocked = req.query.isBlocked as string || 'all';
            const { users, total } = await this.adminService.getAllUsers(page, limit,searchTerm,
                isBlocked);
            sendResponse(res, HttpStatus.OK, "Users retrieved successfully", { users, total, page, limit });
        } catch (error: any) {
            sendError(res, HttpStatus.InternalServerError, error.message || MessageConstants.INTERNAL_SERVER_ERROR);
        }
    }

    async blockRestaurent(req: Request, res: Response): Promise<void> {
        const { restaurentId, isBlocked } = req.body;
        try {
            const updatedRestaurent = await this.adminService.restaurentBlock(restaurentId, isBlocked);
            const message = isBlocked ? MessageConstants.RESTAURENT_BLOCKED : MessageConstants.RESTAURENT_BLOCKED;
            sendResponse(res, HttpStatus.OK, message, { updatedRestaurent });
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