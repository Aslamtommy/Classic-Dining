import { IBranch } from "../models/Restaurent/Branch/BranchModel";

import BranchModel from "../models/Restaurent/Branch/BranchModel";

export class BranchRepository{
    async createBranch(branchData: Partial<IBranch>) {
        return BranchModel.create(branchData);
      }
    
      // Find branch by email
      async findByEmail(email: string) {
        return BranchModel.findOne({ email }).lean()
      }
    
      // Find branches by parent restaurant ID
      async findBranchesByParent(parentId: string):Promise<IBranch[]> {
        return BranchModel.find({ parentRestaurant: parentId });
      }

    
    
     
}