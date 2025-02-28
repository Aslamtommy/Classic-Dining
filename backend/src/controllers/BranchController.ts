 
import { Request, Response } from "express";
import { BranchService } from "../services/BranchService";
import { sendResponse, sendError } from "../utils/responseUtils";
import { HttpStatus } from "../constants/HttpStatus";
import { CloudinaryService } from "../utils/cloudinary.service";
import { BranchRepository } from "../repositories/BranchRepository";
export class BranchController {
  private branchService: BranchService;
private branchRepository:BranchRepository
  constructor() {
    this.branchService = new BranchService();
    this.branchRepository=new BranchRepository()
  }

  // Create a new branch
 
async createBranch(req: Request, res: Response) {
    let imageUrl = "";
    try {
      const { name, email, password, phone, parentRestaurant } = req.body;
  
      // Upload image to Cloudinary
      if (req.file) {
        imageUrl = await CloudinaryService.uploadFile(
          req.file.path,
          "branch_images",
          `branch_${email}`
        );
      }
  
      const branch = await this.branchService.createBranch({
        name,
        email,
        password,
        phone,
        image: imageUrl,
        parentRestaurant,
      });
  
      sendResponse(res, HttpStatus.Created, "Branch created successfully", branch);
    } catch (error: any) {
      // Delete the uploaded image if branch creation fails
      if (imageUrl) {
        const publicId = `branch_images/branch_${req.body.email}`;
        await CloudinaryService.deleteFile(publicId);
      }
  
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }
  async getBranches(req: Request, res: Response) {
    try {
        if (!req.data) {
            throw new Error("Authentication data missing from request");
          }
      const parentId = req.data.id; // Get parent restaurant ID from authenticated user
      const branches = await this.branchService.getBranchesByParent(parentId);
      sendResponse(res, HttpStatus.OK, "Branches fetched successfully", branches);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }
  async getBranchDetails(req: Request, res: Response) {
    try {
      const { branchId } = req.params;

      // Fetch branch details
      const branch = await this.branchRepository.findById(branchId);
      if (!branch) {
        throw new Error('Branch not found');
      }

      sendResponse(res, HttpStatus.OK, 'Branch details fetched successfully', branch);
    } catch (error: any) {
      sendError(res, HttpStatus.NotFound, error.message);
    }
  }


  // Update Branch Method
  async updateBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      const updateData = req.body;
      const imageUrl = req.file ? await this.branchService.handleImageUpload(req.file, branchId) : undefined;
      
      if (imageUrl) {
        updateData.image = imageUrl;
      }

      if (updateData.password) {
        updateData.password = await this.branchService.hashPassword(updateData.password);
      }

      const updatedBranch = await this.branchService.updateBranch(branchId, updateData);
      sendResponse(res, HttpStatus.OK, "Branch updated successfully", updatedBranch);
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

 

  // Delete Branch Method
  async deleteBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      await this.branchService.deleteBranch(branchId);
      sendResponse(res, HttpStatus.OK, "Branch deleted successfully");
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }
}