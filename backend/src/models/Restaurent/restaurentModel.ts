import mongoose, { Schema, Document,ObjectId } from 'mongoose';

export interface IRestaurent extends Document {
 
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    certificate: string;
    isBlocked: boolean;
    isBranch: boolean;
    branches?: mongoose.Types.ObjectId[];
    blockReason?: string;  
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
const RestaurentSchema: Schema = new Schema<IRestaurent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    certificate: { type: String, required: true },
    isBlocked: { type: Boolean, default: true },  
    isApproved:  { type: Boolean, default: false },
    blockReason: { type: String, default: null }, 
    isBranch: { type: Boolean, default: false },

    branches: [{ type: Schema.Types.ObjectId, ref: "Branch" }],
  },
  { timestamps: true }
);

const RestaurentModel = mongoose.model<IRestaurent>('Restaurent', RestaurentSchema);

export default RestaurentModel;
