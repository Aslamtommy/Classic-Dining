// src/types/wallet.ts
export interface Transaction {
    _id: string;
    userId?: string; // Optional since not always returned in frontend
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
  }
  
  export interface WalletData {
    balance: number;
    transactions: Transaction[];
    totalTransactions: number;
  }
  
  export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status?: string;
    [key: string]: any; // For additional Razorpay fields
  }
  
  export interface WalletResponse {
    status: number;
    message: string;
    data: WalletData;
  }
  
  export interface OrderResponse {
    status: number;
    message: string;
    data: RazorpayOrder;
  }
  
  export interface ConfirmAddResponse {
    status: number;
    message: string;
    data: WalletData;
  }
  
  export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    handler: (response: RazorpayResponse) => void;
    modal: {
      ondismiss: () => void;
    };
    theme: {
      color: string;
    };
  }
  
  export interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
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
        order_id: string;
        payment_id: string;
      };
    };
  }