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

  // src/repositories/BranchRepository.ts
async searchBranches(options: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<{ branches: IBranch[]; total: number }> {
  const {
    search = "",
    minPrice,
    maxPrice,
    minRating,
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = options;
  const skip = (page - 1) * limit;

  const match: any = {};
  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    match.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const pipeline: any[] = [
    // Lookup tableTypes to calculate averagePrice
    {
      $lookup: {
        from: "tabletypes",
        localField: "tableTypes",
        foreignField: "_id",
        as: "tableTypesData",
      },
    },
    {
      $addFields: {
        averagePrice: {
          $cond: {
            if: { $gt: [{ $size: "$tableTypesData" }, 0] },
            then: { $avg: "$tableTypesData.price" },
            else: 0,
          },
        },
      },
    },
    // Lookup reservations
    {
      $lookup: {
        from: "reservations",
        localField: "_id",
        foreignField: "branch",
        as: "reservations",
      },
    },
    // Unwind the reviews array within reservations
    {
      $unwind: {
        path: "$reservations",
        preserveNullAndEmptyArrays: true, // Keep branches with no reservations
      },
    },
    {
      $unwind: {
        path: "$reservations.reviews",
        preserveNullAndEmptyArrays: true, // Keep reservations with no reviews
      },
    },
    // Group back by branch to calculate averageRating
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        email: { $first: "$email" },
        phone: { $first: "$phone" },
        mainImage: { $first: "$mainImage" },
        interiorImages: { $first: "$interiorImages" },
        address: { $first: "$address" },
        location: { $first: "$location" },
        parentRestaurant: { $first: "$parentRestaurant" },
        tableTypes: { $first: "$tableTypes" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        averagePrice: { $first: "$averagePrice" },
        averageRating: { $avg: "$reservations.reviews.rating" }, // Average across all reviews
      },
    },
    // Set averageRating to 0 if no reviews exist
    {
      $addFields: {
        averageRating: { $ifNull: ["$averageRating", 0] },
      },
    },
    { $match: match },
  ];

  // Apply price and rating filters
  if (minPrice !== undefined) pipeline.push({ $match: { averagePrice: { $gte: minPrice } } });
  if (maxPrice !== undefined) pipeline.push({ $match: { averagePrice: { $lte: maxPrice } } });
  if (minRating !== undefined) pipeline.push({ $match: { averageRating: { $gte: minRating } } });

  // Sort
  const sortField =
    sortBy === "price" ? "averagePrice" : sortBy === "rating" ? "averageRating" : "name";
  const sortDirection = sortOrder === "asc" ? 1 : -1;
  pipeline.push({ $sort: { [sortField]: sortDirection } });

  // Get total count
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await BranchModel.aggregate(countPipeline).exec();
  const total = countResult[0]?.total || 0;

  // Apply pagination
  pipeline.push({ $skip: skip }, { $limit: limit });

  try {
    const branches = await BranchModel.aggregate(pipeline).exec();
    return { branches, total };
  } catch (error) {
    console.error("Error in searchBranches:", error);
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