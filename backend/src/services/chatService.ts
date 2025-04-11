// src/services/ChatService.ts
 import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { ChatRepository } from '../repositories/chatRepository';
export class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  async getUsersWhoMessaged(branchId: string): Promise<{ id: string; name: string; mobile?: string; profilePicture?: string }[]> {
    try {
      const userIds = await this.chatRepository.getUsersWhoMessaged(branchId);
      if (!userIds.length) {
        return [];
      }
      const users = await this.chatRepository.getUserDetails(userIds);
      return users;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getBranchesForRestaurant(restaurantId: string): Promise<{ id: string; name: string; location?: string }[]> {
    try {
      if (!restaurantId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      return await this.chatRepository.getBranchesForRestaurant(restaurantId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getRestaurantForBranch(branchId: string): Promise<{ id: string; name: string }> {
    try {
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      return await this.chatRepository.getRestaurantForBranch(branchId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}