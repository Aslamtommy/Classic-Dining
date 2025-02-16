// src/services/BranchService.ts
import { IBranch } from "../models/Restaurent/Branch/BranchModel";
import { BranchRepository } from "../repositories/BranchRepository";
import { RestaurentRepository } from "../repositories/RestaurentRepository";

import bcrypt from "bcrypt";

export class BranchService {
    private branchRepository: BranchRepository;
    private restaurentRepository: RestaurentRepository;
    constructor() {
      this.branchRepository = new BranchRepository();
      this.restaurentRepository = new RestaurentRepository();
    }
  
    async createBranch(branchData: Partial<IBranch>) {
        const { email, password, parentRestaurant } = branchData;
    
        // Validate email
        if (!email) {
            throw new Error("Email is required");
        }
    
        // Check if branch already exists
        const existingBranch = await this.branchRepository.findByEmail(email);
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
        const branch = await this.branchRepository.createBranch({
            ...branchData,
            password: hashedPassword,
            isBranch: true,
            parentRestaurant,
        });
    
        // Link branch to parent restaurant
        await this.restaurentRepository.addBranchToRestaurant(parentRestaurant.toString(), branch._id .toString());
    
        return branch;
    }
    async getBranchesByParent(parentId: string): Promise<IBranch[]> {
        return this.branchRepository.findBranchesByParent(parentId);
      }
  }
  