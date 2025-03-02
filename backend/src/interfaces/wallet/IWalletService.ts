 import { ITransaction } from "../../models/User/TransationModel";
export interface IWalletService {
  getWalletData(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ balance: number; transactions: ITransaction[]; totalTransactions: number }>;
  addMoney(
    userId: string,
    amount: number
  ): Promise<{ balance: number; transactions: ITransaction[]; transaction: ITransaction }>;
}