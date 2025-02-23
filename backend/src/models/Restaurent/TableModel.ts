// src/models/TableType.ts
import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ITableType extends Document {
  _id: ObjectId;
  branch: mongoose.Types.ObjectId; // Reference to Branch
  name: string; // Example: "Window 2-seater", "VIP Booth"
  capacity: number; // Number of seats
  quantity: number; // Number of tables of this type
  price: number; // Price of the table
  description?: string; // Optional description
  position?: string; // Example: "Window side", "Terrace"
  minPartySize?: number; // Minimum party size for this table type
  maxPartySize?: number; // Maximum party size for this table type
}

const TableTypeSchema: Schema = new Schema<ITableType>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // Add price field
    description: { type: String },
    position: { type: String },
   
  },
  { timestamps: true }
);

export default mongoose.model<ITableType>('TableType', TableTypeSchema);