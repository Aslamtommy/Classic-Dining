import { Response } from "express";
import logger from "../utils/logger"; // Import your logger

// CommonResponse Class
export class CommonResponse<T = any> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

// ErrorResponse Class
export class ErrorResponse {
  public success: boolean;
  public message: string;
  public error?: string;

  constructor(message: string, error?: string) {
    this.success = false;
    this.message = message;
    this.error = error;
  }
}

// Utility function for sending successful responses
export function sendResponse(res: Response, statusCode: number, message: string, data?: any): void {
  const response = new CommonResponse(message, data);

  // // Log the success response
  // logger.info(`Success Response - Status: ${statusCode}, Message: ${message}, Data: ${JSON.stringify(data)}`);

  res.status(statusCode).json(response);
}

// Utility function for sending error responses
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  additionalData?: any // Add this parameter
): void {
  const errorResponse: any = {
    success: false,
    message: message,
  };

  if (additionalData) {
    errorResponse.data = additionalData; // Store additional data in 'data' field
  }

  // logger.error(`Error Response - Status: ${statusCode}, Message: ${message}`);
  res.status(statusCode).json(errorResponse);
}

