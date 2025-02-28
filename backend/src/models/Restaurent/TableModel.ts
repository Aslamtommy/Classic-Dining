// src/models/TableType.ts
import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ITableType extends Document {
  _id: ObjectId;
  branch: mongoose.Types.ObjectId; // Reference to Branch
  name: string;  
  capacity: number; 
  quantity: number;  
  price: number;  
  description?: string;  
  position?: string;  
  minPartySize?: number; 
  maxPartySize?: number;  
}

const TableTypeSchema: Schema = new Schema<ITableType>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },  
    description: { type: String },
    position: { type: String },
   
  },
  { timestamps: true }
);

export default mongoose.model<ITableType>('TableType', TableTypeSchema);