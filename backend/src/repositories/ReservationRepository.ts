import { IReservation } from '../models/User/Reservation';
import Reservation from '../models/User/Reservation';
import { ReservationStatus } from '../models/User/Reservation';
import { IReservationRepository } from '../interfaces/Reservation/IReservationRepository';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { BaseRepository } from './BaseRepository/BaseRepository';
export class ReservationRepository extends BaseRepository<IReservation> implements IReservationRepository {
   constructor() {
      super(Reservation);
    }
   


  async findById(id: string): Promise<IReservation | null> {
    try {
      return await Reservation.findById(id)
      .populate('branch', 'name')
      .populate('tableType', 'name capacity price')
      .exec();
    } catch (error) {
      console.error('Error in findById:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(id: string, status: 'confirmed' | 'cancelled' | 'payment_failed'): Promise<IReservation | null> {
    try {
      return await Reservation.findByIdAndUpdate(id, { status }, { new: true }).exec();
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

   

  async findAvailability(branchId: string, tableTypeId: string, date: Date, timeSlot: string): Promise<number> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const query = {
        branch: branchId,
        tableType: tableTypeId,
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
      };

      return await Reservation.countDocuments(query);
    } catch (error) {
      console.error('Error in findAvailability:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<string[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const query = {
        branch: branchId,
        reservationDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
      };

      const reservations = await Reservation.find(query).select('tableType').exec();
      return reservations.map((res) => res.tableType.toString());
    } catch (error) {
      console.error('Error in findAvailableTables:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findExpiredPendingReservations(timeoutMinutes: number): Promise<IReservation[]> {
    try {
      const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      return await Reservation.find({
        status: ReservationStatus.PENDING,
        createdAt: { $lt: timeoutDate },
      }).exec();
    } catch (error) {
      console.error('Error in findExpiredPendingReservations:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByUserId(userId: string): Promise<IReservation[]> {
    try {
      return await Reservation.find({ userId })
        .populate('branch', 'name')
        .populate('tableType', 'name capacity price')
        .sort({ reservationDate: -1 })
        .exec();
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByBranchIdWithPagination(
    branchId: string,
    skip: number,
    limit: number,
    status?: ReservationStatus
  ): Promise<IReservation[]> {
    try {
      const query = { branch: branchId, ...(status && { status }) };
      return await Reservation.find(query)
        .populate('userId', 'name email phone')
        .populate('tableType', 'name capacity price')
        .sort({ reservationDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error in findByBranchIdWithPagination:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async countByBranchId(branchId: string, status?: ReservationStatus): Promise<number> {
    try {
      const query = { branch: branchId, ...(status && { status }) };
      return await Reservation.countDocuments(query);
    } catch (error) {
      console.error('Error in countByBranchId:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByUserIdWithPagination(
    userId: string,
    skip: number,
    limit: number,
    status?: ReservationStatus
  ): Promise<IReservation[]> {
    try {
      const query :any = { userId };
      if (status) query.status = status;
      return await Reservation.find(query)
        .populate('branch')
        .populate('tableType')
        .sort({ reservationDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
        
    } catch (error) {
      console.error('Error in findByUserIdWithPagination:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async countByUserId(userId: string, status?: ReservationStatus): Promise<number> {
    try {
      const query: any = { userId };
      if (status) query.status = status;
      return await Reservation.countDocuments(query).exec();
    } catch (error) {
      console.error('Error in countByUserId:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}