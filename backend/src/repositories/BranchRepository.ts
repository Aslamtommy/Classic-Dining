import { IBranch } from "../models/Restaurent/Branch/BranchModel";
import BranchModel from "../models/Restaurent/Branch/BranchModel";
import { Types } from 'mongoose';
import { ObjectId } from "mongoose";

export class BranchRepository {
    async createBranch(branchData: Partial<IBranch>) {
        return BranchModel.create(branchData);
    }

    // Find branch by email
    async findByEmail(email: string) {
        return BranchModel.findOne({ email }).lean();
    }

    // Find branch by ID
    async findById(branchId: string): Promise<IBranch | null> {
        return BranchModel.findById(branchId);
    }

    // Find branches by parent restaurant ID
    async findBranchesByParent(parentId: string): Promise<IBranch[]> {
        return BranchModel.find({ parentRestaurant: parentId });
    }

    async findAll() {
        return BranchModel.find();
    }

    // Add table type to branch
    async addTableType(branchId: string, tableTypeId:ObjectId): Promise<IBranch | null> {
        return BranchModel.findByIdAndUpdate(
            branchId,
            { $push: { tableTypes: tableTypeId } },
            { new: true }
        );
    }

    // Update branch with any fields
    async findByIdAndUpdate(
        branchId: string,
        updateData: Partial<IBranch>
    ): Promise<IBranch | null> {
        return BranchModel.findByIdAndUpdate(branchId, updateData, { new: true });
    }

    async deleteBranch(branchId: string): Promise<void> {
        await BranchModel.findByIdAndDelete(branchId);
      }
      async findByIdUser(branchId: string): Promise<IBranch | null> {
        return BranchModel.findById(branchId)
          .populate('parentRestaurant')
          .populate('tableTypes')
          .exec();
      }
}