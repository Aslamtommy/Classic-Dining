import { ChatRepository } from '../repositories/chatRepository';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  async getUsersWhoMessaged(branchId: string): Promise<{ id: string; name: string; phone?: string; profilePicture?: string }[]> {
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
}