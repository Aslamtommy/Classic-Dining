 

import { generateOtp, hashOtp, compareOtps } from '../utils/GenerateOtp';
import IOtpRepository from '../interfaces/otp/OtpRepositoryInterface';
import { sentMail } from '../utils/SendMails';
import { IOtpService } from '../interfaces/otp/OtpServiceInterface';
export class OtpService implements IOtpService {
 
  constructor(  private otpRepository:IOtpRepository) {
     
  }

  async sendOtp(email: string): Promise<boolean> {
    const otp = generateOtp(); // Generate a new OTP
    const hashedOtp = await hashOtp(otp);
    const stored = await this.otpRepository.storeOtp(hashedOtp, email);

    if (!stored) throw new Error('Error storing OTP.');
    console.log('Generated OTP:', otp);

    // Send OTP via email
    const mailSent = await sentMail(
      email,
      'OTP Verification',
      `<p>Your OTP is: <strong>${otp}</strong></p>`,
    );

    if (!mailSent) throw new Error('Error sending OTP.');
    return true;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.otpRepository.findOtp(email);
    if (!storedOtp)
      throw new Error(
        'No valid OTP found for this email. It may have expired.',
      );

    const isValid = await compareOtps(otp, storedOtp.otp);
    if (!isValid) throw new Error('Invalid OTP.');
    return true;
  }

  async resendOtp(email: string): Promise<boolean> {
    return await this.sendOtp(email);
  }

  
}
