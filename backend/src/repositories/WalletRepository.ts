import Transaction, { ITransaction } from '../models/User/TransationModel';
import userModel from '../models/User/userModel';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class WalletRepository {
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const user = await userModel.findById(userId).select('walletBalance').exec();
      if (!user) throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      return user.walletBalance || 0; // Default to 0 if walletBalance is undefined
    } catch (error) {
      console.error('Error in getWalletBalance:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    try {
      const user = await userModel.findByIdAndUpdate(
        userId,
        { $inc: { walletBalance: amount } },
        { new: true }
      ).exec();
      if (!user) throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
    } catch (error) {
      console.error('Error in updateWalletBalance:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
    try {
      return await Transaction.create(transactionData);
    } catch (error) {
      console.error('Error in createTransaction:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10): Promise<ITransaction[]> {
    try {
      const skip = (page - 1) * limit;
      return await Transaction.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async payWithWallet(userId: string, amount: number, reservationId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await userModel.findById(userId).session(session);
      if (!user) throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      if (typeof user.walletBalance !== 'number') throw new AppError(HttpStatus.InternalServerError, 'User wallet balance is not set');
      if (user.walletBalance < amount) throw new AppError(HttpStatus.BadRequest, MessageConstants.INSUFFICIENT_BALANCE);

      user.walletBalance -= amount;
      await user.save({ session });

      await this.createTransaction({
        userId,
        type: 'debit',
        amount,
        description: `Payment for reservation ${reservationId}`,
        date: new Date(),
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error in payWithWallet:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }
}