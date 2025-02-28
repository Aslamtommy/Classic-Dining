import Transaction,{ITransaction} from '../models/User/TransationModel'

import userModel from '../models/User/userModel'
import mongoose from 'mongoose';
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

      async createTransaction(transactionData: any): Promise<ITransaction> {
        return await Transaction.create(transactionData);
      }

      async getTransactions(userId: string, page: number = 1, limit: number = 10): Promise<ITransaction[]> {
        const skip = (page - 1) * limit; // Calculate how many documents to skip
        return await Transaction.find({ userId })
          .sort({ date: -1 })  
          .skip(skip)         
          .limit(limit)        
          .exec();
      }

      async payWithWallet(userId:any,amount:number,reservationId:string):Promise<void>{
        const session=await mongoose.startSession()
        session.startTransaction()
        try {
          const user=await userModel.findById(userId).session(session)
          if(!user)throw new Error('User not found')
            if(!user.walletBalance)throw new Error ('User wallet balance is not set')
            if(user.walletBalance<amount)throw new Error('Insufficient wallet balance')
              user.walletBalance-=amount
            await user.save({session})

            //Create transaction record 
           await this.createTransaction({
   userId,
   type:'debit',
amount,
description :`Payment fro reservation ${reservationId}`,
date:new Date()
            })

            await session.commitTransaction()
        } catch (error) {
          await session.abortTransaction();
      throw error;
        }finally{
          session.endSession()
        }
      }
 
}