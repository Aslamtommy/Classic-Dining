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
  ): Promise<{ id: string; name: string; mobile?: string; profilePicture?: string; lastMessage?: string; lastMessageTime?: Date }[]> {
    try {
      const users = await User.find({ _id: { $in: userIds } }, 'name mobile profilePicture').lean();
      const result = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await Message.findOne(
            { userId: user._id, branchId: userIds.length === 1 ? userIds[0] : undefined },
            'message timestamp'
          )
            .sort({ timestamp: -1 })
            .lean();
          return {
            id: user._id.toString(),
            name: user.name,
            mobile: user.mobile || undefined,
            profilePicture: user.profilePicture || undefined,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.timestamp,
          };
        })
      );
      return result;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getBranchesForRestaurant(
    restaurantId: string
  ): Promise<{ id: string; name: string; location?: string; lastMessage?: string; lastMessageTime?: Date }[]> {
    try {
      const branchesFromMessages = await Message.distinct('branchId', { restaurantId }).exec();
      let branches;
47
      if (branchesFromMessages.length > 0) {
        branches = await BranchModel.find({ _id: { $in: branchesFromMessages } }, 'name address')
          .lean()
          .exec();
      } else {
        branches = await BranchModel.find({ parentRestaurant: restaurantId }, 'name address')
          .lean()
          .exec();
      }
      const result = await Promise.all(
        branches.map(async (branch) => {
          const lastMessage = await Message.findOne(
            { branchId: branch._id, restaurantId },
            'message timestamp'
          )
            .sort({ timestamp: -1 })
            .lean();
          return {
            id: branch._id.toString(),
            name: branch.name,
            location: branch.address || undefined,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.timestamp,
          };
        })
      );
      return result;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getRestaurantForBranch(branchId: string): Promise<{ id: string; name: string; lastMessage?: string; lastMessageTime?: Date }> {
    try {
      const branch = (await BranchModel.findById(branchId)
        .populate<{ parentRestaurant: PopulatedRestaurant }>('parentRestaurant', '_id name')
        .lean()
        .exec()) as PopulatedBranch | null;

      if (!branch || !branch.parentRestaurant) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
      }

      const lastMessage = await Message.findOne(
        { branchId, restaurantId: branch.parentRestaurant._id },
        'message timestamp'
      )
        .sort({ timestamp: -1 })
        .lean();

      return {
        id: branch.parentRestaurant._id.toString(),
        name: branch.parentRestaurant.name,
        lastMessage: lastMessage?.message,
        lastMessageTime: lastMessage?.timestamp,
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

  async getRestaurantsForAdmin(adminId: string): Promise<
    { id: string; name: string; lastMessage?: string; lastMessageTime?: Date }[]
  > {
    try {
      const restaurants = await RestaurentModel.find(
        { isApproved: true, isBranch: false },
        'name'
      ).lean();
      if (!restaurants.length) {
        return [];
      }

      const result = await Promise.all(
        restaurants.map(async (restaurant) => {
          const lastMessage = await Message.findOne(
            { adminId, restaurantId: restaurant._id },
            'message timestamp'
          )
            .sort({ timestamp: -1 })
            .lean();
          return {
            id: restaurant._id.toString(),
            name: restaurant.name,
            lastMessage: lastMessage?.message,
            lastMessageTime: lastMessage?.timestamp,
          };
        })
      );

      return result;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getAdminsForRestaurant(restaurantId: string): Promise<
    { id: string; email: string; lastMessage?: string; lastMessageTime?: Date }[]
  > {
    try {
      const superAdmin = await adminModel.findOne(
        { email: 'admin123@gmail.com' },
        'email'
      ).lean();
      if (!superAdmin) {
        return [];
      }

      const lastMessage = await Message.findOne(
        { adminId: superAdmin._id, restaurantId },
        'message timestamp'
      )
        .sort({ timestamp: -1 })
        .lean();

      return [
        {
          id: superAdmin._id.toString(),
          email: superAdmin.email,
          lastMessage: lastMessage?.message,
          lastMessageTime: lastMessage?.timestamp,
        },
      ];
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