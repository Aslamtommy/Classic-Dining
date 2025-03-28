import { IBranchRepository } from "../interfaces/branch/IBranchRepository";
import { IBranch } from "../models/Restaurent/Branch/BranchModel";
import { CloudinaryService } from "../utils/cloudinary.service";
import { IBranchService } from "../interfaces/branch/IBranchService";
import { IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class BranchService implements IBranchService {
  constructor(
    private _branchRepository: IBranchRepository,
    private _restaurentRepository: IRestaurentRepository
  ) {}

  async createBranch(branchData: Partial<IBranch>): Promise<IBranch> {
    try {
      const { email, password, address, location, parentRestaurant, mainImage, interiorImages } = branchData;
      if (!email) throw new AppError(HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
      if (!password) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      if (!address) throw new AppError(HttpStatus.BadRequest, "Address is required");
      if (!location || !location.coordinates) throw new AppError(HttpStatus.BadRequest, "Location coordinates are required");
      if (!parentRestaurant) throw new AppError(HttpStatus.BadRequest, MessageConstants.PARENT_RESTAURANT_REQUIRED);
      if (!mainImage) throw new AppError(HttpStatus.BadRequest, "Main image is required");

      const existingBranch = await this._branchRepository.findByEmail(email);
      if (existingBranch) {
        throw new AppError(HttpStatus.Conflict, MessageConstants.BRANCH_ALREADY_EXISTS);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const branch = await this._branchRepository.createBranch({
        ...branchData,
        password: hashedPassword,
        isBranch: true,
        parentRestaurant,
        mainImage,
        interiorImages: interiorImages || [],
      });

      await this._restaurentRepository.addBranchToRestaurant(parentRestaurant.toString(), branch._id.toString());
      return branch;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getBranchesByParent(parentId: string): Promise<IBranch[]> {
    try {
      return await this._branchRepository.findBranchesByParent(parentId);
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async handleImageUpload(file:  Express.Multer.File, branchId: string): Promise<string> {
    try {
      const branch = await this._branchRepository.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);
      return await CloudinaryService.uploadFile(file.path, "branch_images", `branch_${branch.email}`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.IMAGE_UPLOAD_FAILED);
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.PASSWORD_HASHING_FAILED);
    }
  }
  async updateBranch(branchId: string, updateData: Partial<IBranch>): Promise<IBranch | null> {
    try {
      const branch = await this._branchRepository.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);

      // If interiorImages are provided, replace the existing ones
      if (updateData.interiorImages) {
        updateData.interiorImages = updateData.interiorImages;
      } else {
        delete updateData.interiorImages; // Don't overwrite with undefined
      }

      return await this._branchRepository.findByIdAndUpdate(branchId, updateData);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteBranch(branchId: string): Promise<void> {
    try {
      const branch = await this._branchRepository.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);

      await this._restaurentRepository.removeBranchFromRestaurant(branch.parentRestaurant.toString(), branchId);
      await this._branchRepository.deleteBranch(branchId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getBranchById(branchId: string): Promise<IBranch | null> {
    try {
      return await this._branchRepository.findById(branchId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}