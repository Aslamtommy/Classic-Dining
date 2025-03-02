 
 
import Transation  from "../models/User/TransationModel";
import { IWalletService } from "../interfaces/wallet/IWalletService";
import { IWalletRepository } from "../interfaces/wallet/IWalletRepository";
export class WalletService implements IWalletService{

    constructor(    private _walletRepository:IWalletRepository){
     
    }
    async getWalletData(userId: string, page: number = 1, limit: number = 10) {
      const balance = await this._walletRepository.getWalletBalance(userId);
      const transactions = await this._walletRepository.getTransactions(userId, page, limit);
      const totalTransactions = await Transation.countDocuments({ userId }); // Add this to get total count
      return { balance, transactions, totalTransactions };
    }

    async addMoney(userId: any, amount: number) {
        if (amount <= 0) throw new Error('Amount must be positive');
        await this._walletRepository.updateWalletBalance(userId, amount);
        const transaction  = await this._walletRepository.createTransaction({
          userId,
          type: 'credit',
          amount,
          description: 'Added to wallet',
        });
        const balance = await this._walletRepository.getWalletBalance(userId);
        const transactions = await this._walletRepository.getTransactions(userId);
        return { balance, transactions, transaction };
      }  
 
   
}