 import { ITransaction } from "../../models/User/TransationModel";
export interface IWalletRepository {
  getWalletBalance(userId: string): Promise<number>;
  updateWalletBalance(userId: string, amount: number): Promise<void>;
  createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction>;
  getTransactions(userId: string, page?: number, limit?: number): Promise<ITransaction[]>;
  payWithWallet(userId: string, amount: number, reservationId: string): Promise<void>;
}