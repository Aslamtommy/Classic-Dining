// controllers/ReservationController.ts
import { Request, Response } from 'express';
import { ReservationService } from '../services/ReservationService';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { sendResponse, sendError } from '../utils/responseUtils';
import { WalletRepository } from '../repositories/WalletRepository';
import { CouponRepository } from '../repositories/CouponRepository';
import { ReservationStatus } from '../models/User/Reservation';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_ihsNz6lracNIu3',
  key_secret: 'f2SAIeZnMz9gBmhNUtCDSLwy'
});

export class ReservationController {
  private reservationService: ReservationService;

  constructor() {
    this.reservationService = new ReservationService(
      new ReservationRepository(),
      new BranchRepository(),
      new TableTypeRepository(),
      new WalletRepository(),
      new CouponRepository()
    );
  }

  async createReservation(req: Request, res: Response) {
    try {
      const userId=req.data?.id
   const    reservationData={...req.body,userId}
      const reservation = await this.reservationService.createReservation(reservationData);
      sendResponse(res, 201, 'Reservation created successfully', reservation);
    } catch (error: any) {
      console.error('Reservation creation error:', error.message, error.stack);
      sendError(res, 400, error.message || 'Failed to create reservation');
    }
  }

  async getReservation(req: Request, res: Response) {
    try {
      const reservation = await this.reservationService.getReservation(req.params.id);
      if (!reservation) {
        return sendError(res, 404, 'Reservation not found');
      }
      sendResponse(res, 200, 'Reservation fetched successfully', reservation);
    } catch (error: any) {
      console.error('Reservation fetch error:', error.message, error.stack);
      sendError(res, 500, error.message || 'Failed to fetch reservation');
    }
  }

  async cancelReservation(req: Request, res: Response) {
    try {
      const reservation = await this.reservationService.cancelReservation(req.params.id);
      if(!reservation){
        return sendError(res,404,'Reservation not found')
      }
      console.log(`Reservation ${req.params.id} cancelled${reservation.status === 'confirmed' ? ', amount credited to wallet' : ''}`);
      sendResponse(res, 200, 'Reservation cancelled successfully', reservation);
    } catch (error: any) {
      console.error('Reservation cancellation error:', error.message, error.stack);
      sendError(res, 400, error.message || 'Failed to cancel reservation');
    }
  }

  async confirmReservation(req: Request, res: Response) {
    try {
      const { paymentId } = req.body;
      const reservation = await this.reservationService.confirmReservation(req.params.id, paymentId);
      sendResponse(res, 200, 'Reservation confirmed successfully', reservation);
    } catch (error: any) {
      console.error('Reservation confirmation error:', error.message, error.stack);
      sendError(res, 400, error.message || 'Failed to confirm reservation');
    }
  }

  async failReservation(req: Request, res: Response) {
    try {
      console.log('failReservation called with ID:', req.params.id);
      const { paymentId } = req.body;
      const reservation = await this.reservationService.failReservation(req.params.id, paymentId);
      sendResponse(res, 200, 'Reservation marked as payment failed', reservation) 
    } catch (error: any) {
      console.error('Reservation payment failure error:', error.message, error.stack);
      
      sendError(res, 400, error.message || 'Failed to mark reservation as payment failed' );
    }
  }

  async getAvailableTables(req: Request, res: Response) {
    try {
      console.log('getAvailableTables called with:', req.query);
      const { branchId, date, timeSlot } = req.query;
      if (!branchId || !date || !timeSlot) {
        return sendError(res, 400, 'Branch ID, date, and time slot are required');
      }

      const availableTables = await this.reservationService.getAvailableTables(
        branchId as string,
        new Date(date as string),
        timeSlot as string
      );

      sendResponse(res, 200, 'Available tables fetched successfully', availableTables);
    } catch (error: any) {
      console.error('Error fetching available tables:', error.message, error.stack);
      sendError(res, 500, error.message || 'Failed to fetch available tables');
    }
  }

  async createPaymentOrder(req: Request, res: Response) {
    try {
      const { amount, currency } = req.body;
      const options = {
        amount: amount,
        currency: currency,
        receipt: `reserve_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);
      sendResponse(res, 200, 'Order created successfully', order);
    } catch (error: any) {
      console.error('Payment order error:', error);
      sendError(res, 500, 'Failed to create payment order');
    }
    
  }

 
  async getUserReservations(req: Request, res: Response) {
    try {
      const userId = req.data?.id; // From auth middleware
      if (!userId) {
        return sendError(res, 401, 'User not authenticated');
      }
      const { page = '1', limit = '10', status } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
  
      const result = await this.reservationService.getUserReservationsWithPagination(
        userId,
        pageNum,
        limitNum,
        status as ReservationStatus | undefined
      );
  
      sendResponse(res, 200, 'Reservations fetched successfully', {
        reservations: result.reservations,
        total: result.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(result.total / limitNum),
      });
    } catch (error: any) {
      console.error('Error fetching user reservations:', error.message, error.stack);
      sendError(res, 500, error.message || 'Failed to fetch reservations');
    }
  }
async confirmWithWallet(req: Request, res: Response) {
  try {
    const userId = req.data?.id; // Assuming req.data.id comes from auth middleware
    const reservationId = req.params.id;
    if (!userId) return sendError(res, 401, 'User not authenticated');

    const reservation = await this.reservationService.confirmWithWallet(reservationId, userId);
    sendResponse(res, 200, 'Reservation confirmed with wallet', reservation);
  } catch (error: any) {
    console.error('Wallet payment error:', error.message, error.stack);
    sendError(res, 400, error.message || 'Failed to confirm with wallet');
  }
}

 async getBranchReservations(req: Request, res: Response) {
  try {
    const { branchId } = req.params;
    const authenticatedBranchId = req.data?.id;
    if (branchId !== authenticatedBranchId) {
      return sendError(res, 403, 'You can only access your own branch reservations');
    }

    const { page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await this.reservationService.getBranchReservations(
      branchId,
      pageNum,
      limitNum,
      status as ReservationStatus | undefined
    );

    sendResponse(res, 200, 'Branch reservations fetched successfully', {
      reservations: result.reservations,
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.total / limitNum),
    });
  } catch (error: any) {
    console.error('Error fetching branch reservations:', error.message, error.stack);
    sendError(res, 500, error.message || 'Failed to fetch branch reservations');
  }
}


async updateBranchReservationStatus(req:Request,res:Response){
  
  try {
    const {reservationId}=req.params
    const {status}=req.body
    const branchId=req.data?.id

    if(!branchId){
      return sendError(res,401,'Unauthorized')
    }
    const reservation=await this.reservationService.updateBranchReservationStatus(
      reservationId,status,branchId
    )
    sendResponse(res, 200, `Reservation updated to ${status} successfully`, reservation);
  } catch (error:any) {
    console.error('Error updating reservation status:', error.message, error.stack);
    sendError(res, 500, error.message || 'Failed to update reservation status');
  }
}
}