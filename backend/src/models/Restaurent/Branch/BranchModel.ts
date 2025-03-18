import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IBranch extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  image?: string;
  address: string; // New field: human-readable address
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  }; // New field: GeoJSON Point for geospatial queries
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
    address: { type: String, required: true }, // New field
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    }, // New field
    isBranch: { type: Boolean, default: true },
    image: { type: String },
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