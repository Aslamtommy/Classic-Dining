// src/repositories/ChatRepository.ts
import Message from '../models/User/message';
import User from '../models/User/userModel';
import BranchModel from '../models/Restaurent/Branch/BranchModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { Types } from 'mongoose';
import RestaurentModel from '../models/Restaurent/restaurentModel';
import adminModel from '../models/Admin/adminModel';

interface PopulatedRestaurant {
  _id: Types.ObjectId;
  name: string;
}

interface PopulatedBranch {
  _id: Types.ObjectId;
  name: string;
  address?: string;
  parentRestaurant: PopulatedRestaurant;
}

export class ChatRepository {
  async getUsersWhoMessaged(branchId: string): Promise<string[]> {
    try {
      const userIds = await Message.distinct('userId', { branchId }).exec();
      return userIds;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getUserDetails(
    userIds: string[]
  ): Promise<{ id: string; name: string; mobile?: string; profilePicture?: string }[]> {
    try {
      const users = await User.find({ _id: { $in: userIds } }, 'name mobile profilePicture').lean();
      return users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        mobile: user.mobile || undefined,
        profilePicture: user.profilePicture || undefined,
      }));
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getBranchesForRestaurant(
    restaurantId: string
  ): Promise<{ id: string; name: string; location?: string }[]> {
    try {
      const branchesFromMessages = await Message.distinct('branchId', { restaurantId }).exec();
      let branches;
      if (branchesFromMessages.length > 0) {
        branches = await BranchModel.find({ _id: { $in: branchesFromMessages } }, 'name address')
          .lean()
          .exec();
      } else {
        branches = await BranchModel.find({ parentRestaurant: restaurantId }, 'name address')
          .lean()
          .exec();
      }
      return branches.map((branch) => ({
        id: branch._id.toString(),
        name: branch.name,
        location: branch.address || undefined,
      }));
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getRestaurantForBranch(branchId: string): Promise<{ id: string; name: string }> {
    try {
      const branch = (await BranchModel.findById(branchId)
        .populate<{ parentRestaurant: PopulatedRestaurant }>('parentRestaurant', '_id name')
        .lean()
        .exec()) as PopulatedBranch | null;

      if (!branch || !branch.parentRestaurant) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
      }

      return {
        id: branch.parentRestaurant._id.toString(),
        name: branch.parentRestaurant.name,
      };
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async findMessagesByUserAndBranch(userId: string, branchId: string): Promise<any[]> {
    try {
      return await Message.find({ userId, branchId }).sort({ timestamp: 1 }).lean().exec();
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async findMessagesByRestaurantAndBranch(restaurantId: string, branchId: string): Promise<any[]> {
    try {
      return await Message.find({ restaurantId, branchId }).sort({ timestamp: 1 }).lean().exec();
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getRestaurantsForAdmin(adminId: string): Promise<{ id: string; name: string }[]> {
    try {
      // Fetch all approved main restaurants (not branches)
      const restaurants = await RestaurentModel.find(
        { isApproved: true, isBranch: false },
        'name'
      ).lean();
      
      if (!restaurants.length) {
        return [];
      }

      return restaurants.map((restaurant) => ({
        id: restaurant._id.toString(),
        name: restaurant.name,
      }));
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getAdminsForRestaurant(restaurantId: string): Promise<{ id: string; email: string }[]> {
    try {
      const adminIds = await Message.distinct('adminId', { restaurantId }).exec();
      if (!adminIds.length) {
        return [];
      }
      const admins = await adminModel.find({ _id: { $in: adminIds } }, 'email').lean();
      return admins.map((admin) => ({
        id: admin._id.toString(),
        email: admin.email,
      }));
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async findMessagesByAdminAndRestaurant(adminId: string, restaurantId: string): Promise<any[]> {
    try {
      return await Message.find({ adminId, restaurantId }).sort({ timestamp: 1 }).lean().exec();
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }
}