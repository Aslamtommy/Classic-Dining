import { Request, Response } from 'express';
import { IWalletService } from '../interfaces/wallet/IWalletService';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
import Razorpay from 'razorpay';
import { AppError } from '../utils/AppError';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});


export class WalletController {
  constructor(private _walletService: IWalletService) {}

  async getWalletData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { page = 1, limit = 10 } = req.query;
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);

      const walletData = await this._walletService.getWalletData(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.WALLET_DATA_FETCHED, walletData);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async createAddMoneyOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { amount } = req.body;

      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      if (!amount) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_AMOUNT);
      }

      const razorpayAmount = Math.round(parsedAmount * 100);
      const options = {
        amount: razorpayAmount,
        currency: 'INR',
        receipt: `wallet_${userId.slice(0, 10)}_${Date.now().toString().slice(-6)}`,
      };

      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order);

      sendResponse(res, HttpStatus.OK, MessageConstants.WALLET_ORDER_CREATED, order);
    } catch (error: unknown) {
      console.error('Detailed error in createAddMoneyOrder:', {
        message: error instanceof Error ? error.message : 'No message provided',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        code: (error as any).code || 'No error code',
        razorpayError: (error as any).response ? (error as any).response.data : 'No Razorpay response',
      });

      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        const errorMessage =
          (error as any).response?.data?.error?.description || MessageConstants.INTERNAL_SERVER_ERROR;
        sendError(res, HttpStatus.InternalServerError, errorMessage);
      }
    }
  }

  async confirmAddMoney(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { amount } = req.body;
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      if (!amount) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_AMOUNT);
      }

      const walletData = await this._walletService.addMoney(userId, parsedAmount);
      sendResponse(res, HttpStatus.OK, MessageConstants.WALLET_MONEY_ADDED, walletData);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}