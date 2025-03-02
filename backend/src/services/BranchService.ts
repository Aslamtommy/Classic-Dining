// src/services/BranchService.ts
import { IBranchRepository } from "../interfaces/branch/IBranchRepository";
import { IBranch } from "../models/Restaurent/Branch/BranchModel";
 
 
import { CloudinaryService } from "../utils/cloudinary.service";
import { IBranchService } from "../interfaces/branch/IBranchService";
 import { IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import bcrypt from "bcrypt";

export class BranchService implements IBranchService {

   
    constructor( private _branchRepository: IBranchRepository, private _restaurentRepository: IRestaurentRepository) {}


    
  
    async createBranch(branchData: Partial<IBranch>) {
        const { email, password, parentRestaurant } = branchData;
    
        // Validate email
        if (!email) {
            throw new Error("Email is required");
        }
    
        // Check if branch already exists
        const existingBranch = await this. _branchRepository.findByEmail(email);
        if (existingBranch) {
            throw new Error("Branch with this email already exists");
        }
    
        // Validate password
        if (!password) {
            throw new Error("Password is required");
        }
    
        // Validate parentRestaurant
        if (!parentRestaurant) {
            throw new Error("Parent restaurant ID is required");
        }
    
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Create branch
        const branch = await this. _branchRepository.createBranch({
            ...branchData,
            password: hashedPassword,
            isBranch: true,
            parentRestaurant,
        });
    
        // Link branch to parent restaurant
        await this._restaurentRepository.addBranchToRestaurant(parentRestaurant.toString(), branch._id .toString());
    
        return branch;
    }
    async getBranchesByParent(parentId: string): Promise<IBranch[]> {
        return this. _branchRepository.findBranchesByParent(parentId);
      }

      async handleImageUpload(file: any, branchId: string): Promise<string | undefined> {
        const branch = await this. _branchRepository.findById(branchId);
        if (!branch) throw new Error("Branch not found");
    
        
    
        return await CloudinaryService.uploadFile(file.path, "branch_images", `branch_${branch.email}`);
      }
      async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
      }

      async updateBranch(branchId: string, updateData: any): Promise<IBranch | null> {
        const branch = await this. _branchRepository.findById(branchId);
        if (!branch) throw new Error("Branch not found");
    
        return await this. _branchRepository.findByIdAndUpdate(branchId, updateData);
      }

      async deleteBranch(branchId: string): Promise<void> {
        const branch = await this. _branchRepository.findById(branchId);
        if (!branch) throw new Error("Branch not found");
      
        
      
        // Remove the branch from the parent restaurant
        await this._restaurentRepository.removeBranchFromRestaurant(
          branch.parentRestaurant.toString(),
          branchId
        );
      
        // Delete the branch
        await this. _branchRepository.deleteBranch(branchId);
      }
      
      async getBranchById(branchId:string):Promise<IBranch | null> {
        const branch = await this. _branchRepository.findById(branchId);
        return branch;
      }
  }
  