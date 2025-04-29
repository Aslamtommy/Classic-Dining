import mongoose, { Schema, Document, Types } from 'mongoose';
import { ITableType } from '../Restaurent/TableModel';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  CANCELLED = 'cancelled',
  PAYMENT_PENDING = 'payment_pending',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

export interface IReview {
  userName: string;
  rating: number; 
  comment?: string;
  createdAt: Date;
}

export interface IReservation extends Document {
  userId: Types.ObjectId;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  branch: Types.ObjectId;
  tableType: Types.ObjectId | ITableType
  reservationDate: Date;
  timeSlot: string;
  partySize: number;
  status:ReservationStatus
  tableQuantity: number; 
  
  preferences: string[]
  paymentId?: string;
  paymentMethod?: 'razorpay' | 'wallet';
  
  couponCode?: string;          
  discountApplied?: number;    
  finalAmount?: number;
  
  createdAt: Date;
  updatedAt: Date;
  specialRequests?: string;
 
 
  reviews?: IReview[];
  whatsappOptIn: boolean; // New field for WhatsApp opt-in
}
const ReviewSchema = new Schema<IReview>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },  
  createdAt: { type: Date, default: Date.now },
  userName: { type: String, required: true },
});

const ReservationSchema: Schema = new Schema({

  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  tableType: { type: Schema.Types.ObjectId, ref: 'TableType', required: true },
  reservationDate: { type: Date, required: true },
  timeSlot: { type: String, required: true   },
  partySize: { type: Number, required: true },
  tableQuantity: { type: Number, default: 1 }, // Default to 1 table
  preferences: [{ type: String, enum: ['windowView', 'outdoor', 'accessible', 'quiet', 'booth', 'private'] }],
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.PENDING,
  },
  paymentId: { type: String },
  paymentMethod: { type: String, enum: ['razorpay', 'wallet'] },
  specialRequests: { type: String },
  couponCode: { type: String },                
  discountApplied: { type: Number, default: 0 }, 
  finalAmount: { type: Number },
  reviews: { type: [ReviewSchema], default: [] },
  whatsappOptIn: { type: Boolean, default: true }, // Default to false
}, { timestamps: true });
ReservationSchema.index({ reservationDate: 1 });
export default mongoose.model<IReservation>('Reservation', ReservationSchema);