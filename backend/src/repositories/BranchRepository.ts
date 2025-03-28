import { IBranchRepository } from "../interfaces/branch/IBranchRepository";
import { IBranch } from "../models/Restaurent/Branch/BranchModel";
import BranchModel from "../models/Restaurent/Branch/BranchModel";
import { ObjectId } from "mongoose";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { BaseRepository } from "./BaseRepository/BaseRepository";
export class BranchRepository extends BaseRepository<IBranch> implements IBranchRepository {
  constructor() {
    super(BranchModel);
  }
  createBranch = this.create.bind(this);
  deleteBranch = this.delete.bind(this);

  
  async findById(branchId: string): Promise<IBranch | null> {
    try {
      console.log('repositorybranchid', branchId); // Log the raw value
      if (typeof branchId !== 'string') {
        throw new Error(`Expected branchId to be a string, got ${typeof branchId}`);
      }
      return await BranchModel.findById(branchId).exec();
    } catch (error) {
      console.error('Error in findById:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }


  async findBranchesByParent(parentId: string): Promise<IBranch[]> {
    try {
      return await BranchModel.find({ parentRestaurant: parentId }).exec();
    } catch (error) {
      console.error('Error in findBranchesByParent:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

   

  async addTableType(branchId: string, tableTypeId: ObjectId): Promise<IBranch | null> {
    try {
      return await BranchModel.findByIdAndUpdate(
        branchId,
        { $push: { tableTypes: tableTypeId } },
        { new: true }
      ).exec();
    } catch (error) {
      console.error('Error in addTableType:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByIdAndUpdate(branchId: string, updateData: Partial<IBranch>): Promise<IBranch | null> {
    try {
      return await BranchModel.findByIdAndUpdate(branchId, updateData, { new: true }).exec();
    } catch (error) {
      console.error('Error in findByIdAndUpdate:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  
  async findByIdUser(branchId: string): Promise<IBranch | null> {
    try {
      return await BranchModel.findById(branchId)
        .populate('parentRestaurant')
        .populate('tableTypes')
        .exec();
    } catch (error) {
      console.error('Error in findByIdUser:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async searchBranches(query: string, skip: number = 0, limit: number = 10): Promise<IBranch[]> {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return await BranchModel.find().skip(skip).limit(limit).lean();
      }
      const searchRegex = new RegExp(trimmedQuery, 'i');
      return await BranchModel.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error in searchBranches:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async countBranches(query: string): Promise<number> {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return await BranchModel.countDocuments();
      }
      const searchRegex = new RegExp(trimmedQuery, 'i');
      return await BranchModel.countDocuments({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      });
    } catch (error) {
      console.error('Error in countBranches:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}