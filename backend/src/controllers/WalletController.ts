
// controllers/WalletController.ts
import { Request, Response } from 'express';
 import { IWalletService } from '../interfaces/wallet/IWalletService';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { sendResponse, sendError } from '../utils/responseUtils';
 import Razorpay from 'razorpay';
 


 const razorpay = new Razorpay({
  key_id: 'rzp_test_ihsNz6lracNIu3',
  key_secret: 'f2SAIeZnMz9gBmhNUtCDSLwy'
})


export class WalletController {


  constructor(  private _walletService: IWalletService   ) {}
   
 


  async getWalletData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { page = 1, limit = 10 } = req.query; 
      if (!userId) {
        sendError(res, HttpStatus.Unauthorized, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }
      const walletData = await this._walletService.getWalletData(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );
      sendResponse(res, HttpStatus.OK, 'Wallet data fetched successfully', walletData);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message || 'Failed to fetch wallet data');
    }
  }

   

  async createAddMoneyOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const { amount } = req.body;
  
      
  
      if (!userId) {
        console.log('No userId found in request');
        sendError(res, HttpStatus.Unauthorized, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }
  
      if (!amount) {
        console.log('Amount is missing in request body');
        sendError(res, HttpStatus.BadRequest, 'Amount is required');
        return;
      }
  
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        console.log('Invalid amount:', amount);
        sendError(res, HttpStatus.BadRequest, 'Amount must be a positive number');
        return;
      }
  
      const razorpayAmount = Math.round(parsedAmount * 100);
      const options = {
        amount: razorpayAmount,
        currency: 'INR',
      receipt: `wallet_${userId.slice(0, 10)}_${Date.now().toString().slice(-6)}`,
      };
 
  
      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order);
  
      sendResponse(res, HttpStatus.OK, 'Order created successfully', order);
    } catch (error: any) {
      console.error('Detailed error in createAddMoneyOrder:', {
        message: error.message || 'No message provided',
        stack: error.stack || 'No stack trace',
        code: error.code || 'No error code',
        razorpayError: error.response ? error.response.data : 'No Razorpay response',
      });
  
      const errorMessage =
        error.response?.data?.error?.description ||
        error.message ||
        'Failed to create order due to an unexpected error';
      sendError(res, HttpStatus.InternalServerError, errorMessage);
    }
  }
  async confirmAddMoney(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const {  amount } = req.body;
      if (!userId) {
        sendError(res, HttpStatus.Unauthorized, MessageConstants.USER_ID_NOT_FOUND);
        return;
      }
       
      // If signature is valid, add money to wallet
      const walletData = await this._walletService.addMoney(userId, amount);
      sendResponse(res, HttpStatus.OK, 'Money added successfully', walletData);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message || 'Failed to add money');
    }
  }
}