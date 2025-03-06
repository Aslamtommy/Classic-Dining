import { Request, Response } from "express";
import { sendResponse, sendError } from "../utils/responseUtils";
import { HttpStatus } from "../constants/HttpStatus";
import { CloudinaryService } from "../utils/cloudinary.service";
import { IBranchService } from "../interfaces/branch/IBranchService";
import { AppError } from "../utils/AppError";
import { MessageConstants } from "../constants/MessageConstants";

export class BranchController {
  constructor(private _branchService: IBranchService) {}

  async createBranch(req: Request, res: Response): Promise<void> {
    let imageUrl = "";
    try {
      const { name, email, password, phone, parentRestaurant } = req.body;
      if (!name || !email || !password || !phone || !parentRestaurant) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      if (req.file) {
        imageUrl = await CloudinaryService.uploadFile(req.file.path, "branch_images", `branch_${email}`);
      }

      const branch = await this._branchService.createBranch({
        name,
        email,
        password,
        phone,
        image: imageUrl,
        parentRestaurant,
      });

      sendResponse(res, HttpStatus.Created, MessageConstants.BRANCH_CREATED, branch);
    } catch (error: unknown) {
    
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getBranches(req: Request, res: Response): Promise<void> {
    try {
      if (!req.data?.id) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      }
      const parentId = req.data.id;
      const branches = await this._branchService.getBranchesByParent(parentId);
      sendResponse(res, HttpStatus.OK, MessageConstants.BRANCHES_FETCHED, branches);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getBranchDetails(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      const branch = await this._branchService.getBranchById(branchId);
      if (!branch) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.PROFILE_FETCHED_SUCCESS, branch);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const updateData = req.body;
      const imageUrl = req.file ? await this._branchService.handleImageUpload(req.file, branchId) : undefined;
      
      if (imageUrl) updateData.image = imageUrl;
      if (updateData.password) updateData.password = await this._branchService.hashPassword(updateData.password);

      const updatedBranch = await this._branchService.updateBranch(branchId, updateData);
      if (!updatedBranch) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.BRANCH_UPDATED, updatedBranch);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      await this._branchService.deleteBranch(branchId);
      sendResponse(res, HttpStatus.OK, MessageConstants.BRANCH_DELETED);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}