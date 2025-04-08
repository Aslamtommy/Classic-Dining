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
    try {
      const { name, email, password, phone, address, longitude, latitude, parentRestaurant } = req.body;
      if (!name || !email || !password || !phone || !address || !longitude || !latitude || !parentRestaurant) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      // Handle file uploads  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let mainImageUrl = "";
      let interiorImageUrls: string[] = [];

      if (files) {
        if (files["mainImage"] && files["mainImage"][0]) {
          mainImageUrl = await CloudinaryService.uploadFile(
            files["mainImage"][0].path,
            "branch_images",
            `branch_${email}_main`
          );
        } else {
          throw new AppError(HttpStatus.BadRequest, "Main image is required");
        }

        if (files["interiorImages"]) {
          interiorImageUrls = await Promise.all(
            files["interiorImages"].map((file, index) =>
              CloudinaryService.uploadFile(file.path, "branch_images", `branch_${email}_interior_${index}`)
            )
          );
        }
      } else {
        throw new AppError(HttpStatus.BadRequest, "Main image is required");
      }

      const branch = await this._branchService.createBranch({
        name,
        email,
        password,
        phone,
        address,
        location: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        mainImage: mainImageUrl,
        interiorImages: interiorImageUrls,
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
      const { name, email, password, phone, address, longitude, latitude } = req.body;
      const updateData: any = { name, email, password, phone, address };
      if (longitude && latitude) {
        updateData.location = { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] };
      }

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files) {
        if (files["mainImage"] && files["mainImage"][0]) {
          updateData.mainImage = await CloudinaryService.uploadFile(
            files["mainImage"][0].path,
            "branch_images",
            `branch_${email || branchId}_main`
          );
        }
        if (files["interiorImages"]) {
          const newInteriorImages = await Promise.all(
            files["interiorImages"].map((file, index) =>
              CloudinaryService.uploadFile(file.path, "branch_images", `branch_${email || branchId}_interior_${index}`)
            )
          );
          updateData.interiorImages = newInteriorImages;  
        }
      }

      if (updateData.password) {
        updateData.password = await this._branchService.hashPassword(updateData.password);
      }

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

  async getBranchProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.data?.id) {
        throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      }

      const branchId = req.data.id;
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
}