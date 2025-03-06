 
import { RazorpayOptions, RazorpayErrorResponse } from './wallet';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: RazorpayErrorResponse) => void) => void;
    };
  }
}