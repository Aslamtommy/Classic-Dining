 
 
export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    image?: string;
    handler: (response: RazorpayResponse) => void;
    modal: {
      ondismiss: () => void;
    };
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    theme: {
      color: string;
    };
  }
  
  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
  
  export interface RazorpayErrorResponse {
    error: {
      code: string;
      description: string;
      source: string;
      step: string;
      reason: string;
      metadata: {
        payment_id: string;
        order_id: string;
      };
    };
  }
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAYMENT_FAILED = 'payment_failed',
  CANCELLED = 'cancelled',
  PAYMENT_PENDING = 'payment_pending',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
}

export interface TableType {
    _id: string;
    name: string;
    price: number;
    capacity: number;
    quantity: number;
    branch?: string; 
    description?: string;  
  }

export interface Reservation {
  _id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  branch: { _id: string; name: string };
  tableType: TableType;
  reservationDate: string;
  timeSlot: string;
  partySize: number;
  status: ReservationStatus;
  paymentId?: string;
  paymentMethod?: 'razorpay' | 'wallet';
  specialRequests?: string;
  couponCode?: string;
  discountApplied?: number;
  finalAmount?: number;
  createdAt: string;
  updatedAt: string;
}
export interface PaymentResponse {
    status: number;
    success: boolean;
    message: string;
    data: {
      amount: number;
      currency: string;
      id: string;
      amount_due?: number;
      amount_paid?: number;
      attempts?: number;
      created_at?: number;
      entity?: string;
      notes?: any[];
      offer_id?: string | null;
      receipt?: string;
      status?: string;
    };
  }

export interface ReservationResponse {
  status: number;
  message: string;
  data: Reservation;
  success: boolean;
}

export interface ReservationsResponse {
  status: number;
  message: string;
  data: {
    reservations: Reservation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
}

export interface AvailableTablesResponse {
  status: number;
  message: string;
  data: TableType[];
  success: boolean;
}

export interface Coupon {
    _id: string;
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    expiryDate: string;
    isActive: boolean;
    createdAt?: string;  
    updatedAt?: string;  
  }

export interface CouponsResponse {
  status: number;
  message: string;
  data: Coupon[];
  success: boolean;
}

// Reusing wallet types for consistency
export interface WalletData {
  balance: number;
  transactions: {
    _id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }[];
  totalTransactions: number;
}

export interface WalletResponse {
  status: number;
  message: string;
  data: WalletData;
  success: boolean;
}
export interface User {
  _id: string;
  name: string;
}



export interface Booking {
  _id: string;
  userId?: User | null;
  tableType: TableType | null;
  reservationDate: string;
  timeSlot: string;
  partySize: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  specialRequests?: string;
}

export interface ApiResponse {
  data: {
    reservations: Booking[];
    totalPages: number;
  };
}
