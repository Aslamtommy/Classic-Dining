// src/repositories/RestaurentRepository.ts
import { IRestaurent } from '../models/Restaurent/restaurentModel';
import { IRestaurentRepository } from '../interfaces/Restaurent/RestaurentRepositoryInterface';
import RestaurentModel from '../models/Restaurent/restaurentModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { FilterQuery } from 'mongoose';
import { BaseRepository } from './BaseRepository/BaseRepository';
export class RestaurentRepository extends BaseRepository<IRestaurent> implements IRestaurentRepository {
  constructor() {
    super(RestaurentModel);
  }
  

  
  async updateRestaurentStatus(restaurentId: string, isBlocked: boolean,isApproved:boolean, blockReason?: string): Promise<IRestaurent | null> {
    try {
      return await RestaurentModel.findByIdAndUpdate(
        restaurentId,
        {
          isBlocked,
          isApproved,
          ...(isBlocked && { blockReason }),
          ...(!isBlocked && { blockReason: null }),
        },
        { new: true }
      ).exec();
    } catch (error: unknown) {
      console.error('Error in updateRestaurentStatus:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  
  async save(restaurent: IRestaurent): Promise<IRestaurent> {
    try {
      return await restaurent.save();
    } catch (error: unknown) {
      console.error('Error in save:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  
  async countAll(filter: FilterQuery<IRestaurent>): Promise<number> {
    try {
      return await RestaurentModel.countDocuments(filter).exec();
    } catch (error: unknown) {
      console.error('Error in countAll:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const user = await RestaurentModel.findById(userId).exec();
      if (!user) throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
      user.password = hashedPassword;
      await user.save();
    } catch (error: unknown) {
      console.error('Error in updatePassword:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async addBranchToRestaurant(restaurentId: string, branchId: string): Promise<void> {
    try {
      const result = await RestaurentModel.findByIdAndUpdate(
        restaurentId,
        { $push: { branches: branchId } },
        { new: true }
      ).exec();
      if (!result) throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
    } catch (error: unknown) {
      console.error('Error in addBranchToRestaurant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async removeBranchFromRestaurant(restaurentId: string, branchId: string): Promise<void> {
    try {
      const result = await RestaurentModel.findByIdAndUpdate(
        restaurentId,
        { $pull: { branches: branchId } },
        { new: true }
      ).exec();
      if (!result) throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
    } catch (error: unknown) {
      console.error('Error in removeBranchFromRestaurant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllPending(filter: FilterQuery<IRestaurent>, skip: number, limit: number): Promise<IRestaurent[]> {
    try {
      return await RestaurentModel.find(filter).skip(skip).limit(limit).lean().exec();
    } catch (error: unknown) {
      console.error('Error in findAllPending:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async countAllPending(filter: FilterQuery<IRestaurent>): Promise<number> {
    try {
      return await RestaurentModel.countDocuments(filter).exec();
    } catch (error: unknown) {
      console.error('Error in countAllPending:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}