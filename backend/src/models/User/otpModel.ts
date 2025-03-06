import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
  },
  { timestamps: true } 
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

export const otp = mongoose.model<IOtp>('otp', otpSchema);
