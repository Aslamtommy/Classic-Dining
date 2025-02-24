
// controllers/WalletController.ts
import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async getWalletData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) {
        sendError(res, HttpStatus.Unauthorized, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }
      const walletData = await this.walletService.getWalletData(userId);
      sendResponse(res, HttpStatus.OK, 'Wallet data fetched successfully', walletData);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message || 'Failed to fetch wallet data');
    }
  }

  async addMoney(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { amount } = req.body;
      if (!userId) {
        sendError(res, HttpStatus.Unauthorized, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }
      if (!amount || amount <= 0) {
        sendError(res, HttpStatus.BadRequest, 'Invalid amount');
        return;
      }
      const walletData = await this.walletService.addMoney(userId, amount);
      sendResponse(res, HttpStatus.OK, 'Money added successfully', walletData);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message || 'Failed to add money');
    }
  }
}