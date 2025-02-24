import mongoose, { Schema, Document, Types } from 'mongoose';


export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  CANCELLED = 'cancelled',
  PAYMENT_PENDING = 'payment_pending',
  EXPIRED = 'expired'
}

export interface IReservation extends Document {
  userId: Types.ObjectId;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  branch: Types.ObjectId;
  tableType: Types.ObjectId;
  reservationDate: Date;
  timeSlot: string;
  partySize: number;
  status:ReservationStatus
  paymentId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.PENDING,
  },
  paymentId: { type: String },
  specialRequests: { type: String },
}, { timestamps: true });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);