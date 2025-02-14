import mongoose, { Schema, Document,ObjectId } from 'mongoose';

export interface IManager extends Document {
 
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    certificate: string;
    isBlocked: boolean;
    blockReason?: string; // Add this field
    createdAt: Date;
    updatedAt: Date;
  }
const ManagerSchema: Schema = new Schema<IManager>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    certificate: { type: String, required: true },
    isBlocked: { type: Boolean, default: true },  
    blockReason: { type: String, default: null }, 
  },
  { timestamps: true }
);

const ManagerModel = mongoose.model<IManager>('Manager', ManagerSchema);

export default ManagerModel;
