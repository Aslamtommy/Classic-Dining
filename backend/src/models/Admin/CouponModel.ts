import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: Date;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  expiryDate: { type: Date, required: true },
  minOrderAmount: { type: Number },
  maxDiscountAmount: { type: Number },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICoupon>('Coupon', CouponSchema);