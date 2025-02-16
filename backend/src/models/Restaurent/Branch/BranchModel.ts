// src/models/BranchModel.ts
import mongoose, { Schema, Document ,ObjectId } from "mongoose";

export interface IBranch extends Document {
    _id : ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  image?: string;
  isBranch: boolean;
  parentRestaurant: mongoose.Types.ObjectId; // Reference to the main restaurant
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isBranch: { type: Boolean, default: true }, 
      image: { type: String },  
    parentRestaurant: { 
      type: Schema.Types.ObjectId, 
      ref: "Restaurent", 
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBranch>("Branch", BranchSchema);