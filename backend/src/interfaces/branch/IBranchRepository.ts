import { IBranch } from "../../models/Restaurent/Branch/BranchModel";
import { ObjectId } from "mongoose";

export interface IBranchRepository {
  createBranch(branchData: Partial<IBranch>): Promise<IBranch>;
  findByEmail(email: string): Promise<IBranch | null>;
  findById(branchId: string): Promise<IBranch | null>;
  findBranchesByParent(parentId: string): Promise<IBranch[]>;
  findAll(): Promise<IBranch[]>;
  addTableType(branchId: string, tableTypeId: ObjectId): Promise<IBranch | null>;
  findByIdAndUpdate(branchId: string, updateData: Partial<IBranch>): Promise<IBranch | null>;
  deleteBranch(branchId: string): Promise<void>;
  findByIdUser(branchId: string): Promise<IBranch | null>;
  searchBranches(query: string, skip?: number, limit?: number): Promise<IBranch[]>;
  countBranches(query: string): Promise<number>;
}