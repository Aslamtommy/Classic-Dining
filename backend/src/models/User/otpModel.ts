import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now  },
  },
  { timestamps: true },
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

export const otp = mongoose.model<IOtp>('otp', otpSchema);
