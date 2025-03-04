import Transaction, { ITransaction } from "../models/User/TransationModel";
import { IWalletService } from "../interfaces/wallet/IWalletService";
import { IWalletRepository } from "../interfaces/wallet/IWalletRepository";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class WalletService implements IWalletService {
  constructor(private _walletRepository: IWalletRepository) {}

  async getWalletData(userId: string, page: number = 1, limit: number = 10):  Promise<{ balance: number; transactions: ITransaction[]; totalTransactions: number }>{
    try {
      const balance = await this._walletRepository.getWalletBalance(userId);
      const transactions = await this._walletRepository.getTransactions(userId, page, limit);
      const totalTransactions = await Transaction.countDocuments({ userId });
      return { balance, transactions, totalTransactions };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async addMoney(userId: string, amount: number): Promise<{ balance: number; transactions: ITransaction[]; transaction: ITransaction }> {
    try {
      if (amount <= 0) throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_AMOUNT);
      await this._walletRepository.updateWalletBalance(userId, amount);
      const transaction = await this._walletRepository.createTransaction({
        userId,
        type: 'credit',
        amount,
        description: 'Added to wallet',
        date: new Date(),
      });
      const balance = await this._walletRepository.getWalletBalance(userId);
      const transactions = await this._walletRepository.getTransactions(userId);
      return { balance, transactions, transaction };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}