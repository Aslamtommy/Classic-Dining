import mongoose, { Schema, Document } from 'mongoose';

interface Location {
  address: string;
}

export interface Restaurant extends Document {
  name: string;
  locations: Location[];
  licenseCertificate: string;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<Restaurant>(
  {
    name: { type: String, required: true },
    locations: [
      {
        address: { type: String, required: true },
      },
    ],
    licenseCertificate: { type: String, required: true },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model<Restaurant>('Restaurant', restaurantSchema);
