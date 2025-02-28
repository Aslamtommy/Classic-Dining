import { ObjectId } from "mongoose";
import { WalletRepository } from "../repositories/WalletRepository";
import Transation  from "../models/User/TransationModel";
export class WalletService{
    private walletRepository:WalletRepository
    constructor(){
        this.walletRepository=new WalletRepository()
    }
    async getWalletData(userId: string, page: number = 1, limit: number = 10) {
      const balance = await this.walletRepository.getWalletBalance(userId);
      const transactions = await this.walletRepository.getTransactions(userId, page, limit);
      const totalTransactions = await Transation.countDocuments({ userId }); // Add this to get total count
      return { balance, transactions, totalTransactions };
    }

    async addMoney(userId: any, amount: number) {
        if (amount <= 0) throw new Error('Amount must be positive');
        await this.walletRepository.updateWalletBalance(userId, amount);
        const transaction  = await this.walletRepository.createTransaction({
          userId,
          type: 'credit',
          amount,
          description: 'Added to wallet',
        });
        const balance = await this.walletRepository.getWalletBalance(userId);
        const transactions = await this.walletRepository.getTransactions(userId);
        return { balance, transactions, transaction };
      }  
 
   
}