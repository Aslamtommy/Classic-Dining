 
import { IBranch } from "../../models/Restaurent/Branch/BranchModel";
 
export interface IBranchService {
    createBranch(branchData: Partial<IBranch>): Promise<IBranch>;
    getBranchesByParent(parentId: string): Promise<IBranch[]>;
    getBranchById(branchId: string): Promise<IBranch | null>; // Added
    handleImageUpload(file: Express.Multer.File, branchId: string): Promise<string | undefined>;
    hashPassword(password: string): Promise<string>;
    updateBranch(branchId: string, updateData: Partial<IBranch>): Promise<IBranch | null>;
    deleteBranch(branchId: string): Promise<void>;
}