 
import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ITransaction extends Document {
  userId: ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);