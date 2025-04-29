import { Request, Response } from 'express';
import { IReservationService } from '../interfaces/Reservation/IReservationService';
import { sendResponse, sendError } from '../utils/responseUtils';
import { ReservationStatus } from '../models/User/Reservation';
import Razorpay from 'razorpay';
import { HttpStatus } from '../constants/HttpStatus';
import { AppError } from '../utils/AppError';
import { MessageConstants } from '../constants/MessageConstants';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export class ReservationController {
  constructor(private _reservationService: IReservationService) {
    // Validate Razorpay credentials on initialization
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in .env');
      throw new Error('Razorpay configuration error: Missing credentials');
    }
    console.log('Razorpay initialized with key_id:', process.env.RAZORPAY_KEY_ID);
  }

  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      const reservationData = { ...req.body, userId };
      console.log('Creating reservation with data:', reservationData);
      const reservation = await this._reservationService.createReservation(reservationData);
      sendResponse(res, HttpStatus.Created, MessageConstants.RESERVATION_CREATED, reservation);
    } catch (error: unknown) {
      console.error('Reservation creation error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getReservation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      console.log('Fetching reservation with ID:', id);
      const reservation = await this._reservationService.getReservation(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATIONS_FETCHED, reservation);
    } catch (error: unknown) {
      console.error('Reservation fetch error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      console.log('Cancelling reservation with ID:', id);
      const reservation = await this._reservationService.cancelReservation(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      console.log(`Reservation ${id} cancelled${reservation.status === 'confirmed' ? ', amount credited to wallet' : ''}`);
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATION_CANCELLED, reservation);
    } catch (error: unknown) {
      console.error('Reservation cancellation error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async confirmReservation(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId, whatsappOptIn } = req.body;
      const id = req.params.id;
      if (!id || !paymentId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      console.log('Confirming reservation with ID:', id, 'Payment ID:', paymentId, 'WhatsApp Opt-in:', whatsappOptIn);
      const reservation = await this._reservationService.confirmReservation(id, paymentId );
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATION_CONFIRMED, reservation);
    } catch (error: unknown) {
      console.error('Reservation confirmation error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async failReservation(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.body;
      const id = req.params.id;
      if (!id || !paymentId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      console.log('Failing reservation with ID:', id, 'Payment ID:', paymentId);
      const reservation = await this._reservationService.failReservation(id, paymentId);
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATION_PAYMENT_FAILED, reservation);
    } catch (error: unknown) {
      console.error('Reservation payment failure error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAvailableTables(req: Request, res: Response): Promise<void> {
    try {
      console.log('Fetching available tables with query:', req.query);
      const { branchId, date, timeSlot } = req.query;
      if (!branchId || !date || !timeSlot) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const availableTables = await this._reservationService.getAvailableTables(
        branchId as string,
        new Date(date as string),
        timeSlot as string
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.AVAILABLE_TABLES_FETCHED, availableTables);
    } catch (error: unknown) {
      console.error('Error fetching available tables:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async createPaymentOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency } = req.body;
      console.log('Creating payment order with:', { amount, currency });
      if (!amount || !currency) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      if (amount < 100) { // Razorpay minimum amount is 1 INR (100 paise)
        throw new AppError(HttpStatus.BadRequest, 'Amount must be at least 100 paise (1 INR)');
      }
      if (currency !== 'INR') {
        throw new AppError(HttpStatus.BadRequest, 'Currency must be INR');
      }
      const options = {
        amount: amount,
        currency: currency,
        receipt: `reserve_${Date.now()}`,
      };
      console.log('Calling Razorpay orders.create with options:', options);
      const order = await razorpay.orders.create(options).catch((err: any) => {
        console.error('Razorpay API error:', err);
        throw new AppError(HttpStatus.InternalServerError, `Razorpay error: ${err.message || 'Failed to create order'}`);
      });
      console.log('Payment order created:', order);
      sendResponse(res, HttpStatus.OK, MessageConstants.PAYMENT_ORDER_CREATED, order);
    } catch (error: unknown) {
      console.error('Payment order error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, `Payment order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async getUserReservations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      const { page = '1', limit = '10', status } = req.query;
      console.log('Fetching user reservations for user:', userId, 'with params:', { page, limit, status });
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const result = await this._reservationService.getUserReservationsWithPagination(
        userId,
        pageNum,
        limitNum,
        status as ReservationStatus | undefined
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATIONS_FETCHED, {
        reservations: result.reservations,
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (error: unknown) {
      console.error('Error fetching user reservations:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async confirmWithWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      const reservationId = req.params.id;
      console.log('Confirming reservation with wallet for user:', userId, 'reservation:', reservationId);
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      if (!reservationId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      const reservation = await this._reservationService.confirmWithWallet(reservationId, userId);
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATION_CONFIRMED_WITH_WALLET, reservation);
    } catch (error: unknown) {
      console.error('Wallet payment error:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.WALLET_CONFIRMATION_FAILED);
      }
    }
  }

  async getBranchReservations(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      const authenticatedBranchId = req.data?.id;
      console.log('Fetching branch reservations for branch:', branchId);
      if (!branchId || branchId !== authenticatedBranchId) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }
      const { page = '1', limit = '10', status } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const result = await this._reservationService.getBranchReservations(
        branchId,
        pageNum,
        limitNum,
        status as ReservationStatus | undefined
      );
      sendResponse(res, HttpStatus.OK, MessageConstants.RESERVATIONS_FETCHED, {
        reservations: result.reservations,
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (error: unknown) {
      console.error('Error fetching branch reservations:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateBranchReservationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const { status } = req.body;
      const branchId = req.data?.id;
      console.log('Updating reservation status for reservation:', reservationId, 'status:', status, 'branch:', branchId);
      if (!branchId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      if (!reservationId || !status) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      const reservation = await this._reservationService.updateBranchReservationStatus(reservationId, status, branchId);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      sendResponse(res, HttpStatus.OK, `Reservation updated to ${status} successfully`, reservation);
    } catch (error: unknown) {
      console.error('Error updating reservation status:', error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error.stack : undefined);
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId) throw new AppError(HttpStatus.Unauthorized, MessageConstants.UNAUTHORIZED);
      const { reservationId } = req.params;
      const { rating, comment } = req.body;
      console.log('Submitting review for reservation:', reservationId, 'by user:', userId, 'data:', { rating, comment });
      if (!reservationId || !rating) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      if (rating < 1 || rating > 5) {
        throw new AppError(HttpStatus.BadRequest, 'Rating must be between 1 and 5');
      }
      const reservation = await this._reservationService.submitReview(reservationId, userId, { rating, comment });
      sendResponse(res, HttpStatus.OK, 'Review submitted successfully', reservation);
    } catch (error: unknown) {
      console.error('Review submission error:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getBranchReviews(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      console.log('Fetching reviews for branch:', branchId);
      if (!branchId) {
        throw new AppError(HttpStatus.BadRequest, 'Branch ID is required');
      }
      const reviews = await this._reservationService.getBranchReviews(branchId);
      sendResponse(res, HttpStatus.OK, 'Reviews fetched successfully', reviews);
    } catch (error: unknown) {
      console.error('Error fetching branch reviews:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}