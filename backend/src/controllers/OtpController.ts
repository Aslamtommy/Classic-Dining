// src/controllers/OtpController.ts
import { Request, Response } from "express";
import { IOtpService } from "../interfaces/otp/OtpServiceInterface";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { sendResponse, sendError } from "../utils/responseUtils";
import { AppError } from "../utils/AppError";

export class OtpController {
  constructor(private otpService: IOtpService) {}

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
      }
      await this.otpService.sendOtp(email);
      sendResponse(res, HttpStatus.OK, MessageConstants.OTP_SENT);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      const isOtpValid = await this.otpService.verifyOtp(email, otp);
      if (!isOtpValid) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_OTP);
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.USER_REGISTER_SUCCESS);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.EMAIL_REQUIRED);
      }

      await this.otpService.resendOtp(email);
      sendResponse(res, HttpStatus.OK, MessageConstants.OTP_SENT);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Unknown error');
      }
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}