import mongoose, { Schema, Document ,ObjectId} from 'mongoose';


export interface IAdmin extends Document{
    _id: ObjectId;

    email:string
    password:string
    createdAt:Date
}


const AdminSchema: Schema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  export default mongoose.model<IAdmin>('Admin', AdminSchema);