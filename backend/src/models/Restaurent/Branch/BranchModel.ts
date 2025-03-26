import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IBranch extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  mainImage?: string; // Main image URL
  interiorImages?: string[]; // Array of interior image URLs
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  isBranch: boolean;
  parentRestaurant: mongoose.Types.ObjectId;
  tableTypes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema: Schema = new Schema<IBranch>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    isBranch: { type: Boolean, default: true },
    mainImage: { type: String }, // Single main image URL
    interiorImages: [{ type: String }], // Array of interior image URLs
    parentRestaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurent",
      required: true,
    },
    tableTypes: [{ type: Schema.Types.ObjectId, ref: "TableType" }],
  },
  { timestamps: true }
);

// Add 2dsphere index for geospatial queries
BranchSchema.index({ location: "2dsphere" });

export default mongoose.model<IBranch>("Branch", BranchSchema);