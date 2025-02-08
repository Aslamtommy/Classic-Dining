import { Request, Response } from "express";
import { IOtpService } from "../interfaces/otp/OtpServiceInterface";
 

 
export class OtpController {
 
  constructor(    private   otpService:IOtpService ) {
   
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }
      await this.otpService.sendOtp(email);
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: any) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: "Error sending OTP.", error: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(400).json({ message: "Email and OTP are required." });
        return;
      }

      const isOtpValid = await this.otpService.verifyOtp(email, otp);

      if (!isOtpValid) {
        res.status(400).json({ message: "Invalid OTP." });
        return;
      }

      res
        .status(200)
        .json({ message: "OTP verified and user registered successfully." });
    } catch (error: any) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: "Error verifying OTP.", error: error.message });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      await this.otpService.resendOtp(email);
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error: any) {
      console.error(error.message);
      res
        .status(500)
        .json({ message: "Error resending OTP.", error: error.message });
    }
  }
}
