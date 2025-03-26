import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import { sendResponse, sendError } from '../utils/responseUtils';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { AppError } from '../utils/AppError';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async getUsersWhoMessaged(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;

      
      if (!req.data?.id || req.data.id !== branchId) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.UNAUTHORIZED);
      }

      const users = await this.chatService.getUsersWhoMessaged(branchId);

      console.log('users', users);
      sendResponse(res, HttpStatus.OK, 'Users who messaged fetched successfully', { users });
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}