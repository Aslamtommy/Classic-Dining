import Transaction,{ITransaction} from '../models/User/TransationModel'

import userModel from '../models/User/userModel'

export class WalletRepository{
    async getWalletBalance(userId: string): Promise<number> {
        const user:any = await userModel.findById(userId).select('walletBalance');
        if (!user) {
          throw new Error('User not found'); // This ensures we throw an error if user is null
        }
 
        return user.walletBalance; // TypeScript now knows this is a number
      }

      async updateWalletBalance(userId:string,amount:number):Promise<void>{
const user=await userModel.findByIdAndUpdate(
    userId,{$inc:{walletBalance:amount}},
    {new :true}
)
if (!user) throw new Error('User not found');
      }

      async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        return await Transaction.create(transactionData);
      }

      async getTransactions(userId: string, limit: number = 1): Promise<ITransaction[]> {
        return await Transaction.find({ userId })
          .sort({ date: -1 })
          .limit(limit)
          .exec();
      }
}