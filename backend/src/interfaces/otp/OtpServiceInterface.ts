export interface IOtpService {
    sendOtp(email: string): Promise<boolean>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    resendOtp(email: string): Promise<boolean>;
  }
  