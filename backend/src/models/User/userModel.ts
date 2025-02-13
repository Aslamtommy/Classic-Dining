import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;  
  mobile_no?: string;   
  is_verified: boolean;
   isBlocked: boolean;
  google_id?: string;  
  profilePicture?: string;
}

const userSchema: Schema = new Schema(
  {
    google_id: { type: String },  
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },  
    mobile_no: { type: String, required: false },
    is_verified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    profilePicture: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', userSchema);
