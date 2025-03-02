// src/services/ReservationService.ts
import { IReservationRepository } from '../interfaces/Reservation/IReservationRepository';
import { IBranchRepository } from '../interfaces/branch/IBranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { ReservationStatus } from '../models/User/Reservation';
import { IWalletRepository } from '../interfaces/wallet/IWalletRepository';
import { IReservation } from '../models/User/Reservation';
import { ICouponRepository } from '../interfaces/coupon/ICouponRepository';
import { ITableType } from '../models/Restaurent/TableModel';
import mongoose, { Types } from 'mongoose';
import { IReservationService } from '../interfaces/Reservation/IReservationService';

export class ReservationService implements IReservationService {
  constructor(
    private _reservationRepo: IReservationRepository,
    private _branchRepo: IBranchRepository,
    private _tableTypeRepo: TableTypeRepository,
    private _walletRepo: IWalletRepository,
    private _couponRepo: ICouponRepository
  ) {}

  async createReservation(reservationData: Partial<IReservation>): Promise<IReservation> {
    const branchId = reservationData.branch?.toString();
    const tableTypeId = reservationData.tableType?.toString();
    if (!branchId || !tableTypeId) throw new Error('Branch and table type are required');

    const [branch, tableType] = await Promise.all([
      this._branchRepo.findById(branchId),
      this._tableTypeRepo.findById(tableTypeId),
    ]);

    if (!branch || !tableType) throw new Error('Invalid branch or table type');
    if ((reservationData.partySize || 0) > tableType.capacity) {
      throw new Error(`Party size exceeds table capacity. Maximum capacity: ${tableType.capacity}`);
    }

    const existingReservations = await this._reservationRepo.findAvailability(
      branchId,
      tableTypeId,
      reservationData.reservationDate as Date,
      reservationData.timeSlot as string
    );

    if (existingReservations >= tableType.quantity) throw new Error('No available tables for selected time slot');

    let discountApplied = 0;
    let finalAmount = tableType.price || 0;

    if (reservationData.couponCode) {
      const coupon = await this._couponRepo.findByCode(reservationData.couponCode);
      if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
        throw new Error('Invalid or expired coupon');
      }
      if (coupon.minOrderAmount && finalAmount < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount of ${coupon.minOrderAmount} required`);
      }
      if (coupon.discountType === 'percentage') {
        discountApplied = (coupon.discount / 100) * finalAmount;
        if (coupon.maxDiscountAmount && discountApplied > coupon.maxDiscountAmount) {
          discountApplied = coupon.maxDiscountAmount;
        }
      } else {
        discountApplied = coupon.discount;
      }
      finalAmount = finalAmount - discountApplied;
      if (finalAmount < 0) finalAmount = 0;
    }

    const reservation = await this._reservationRepo.create({
      ...reservationData,
      couponCode: reservationData.couponCode,
      discountApplied,
      finalAmount,
      branch: new Types.ObjectId(branchId),
      tableType: new Types.ObjectId(tableTypeId),
    });

    return reservation;
  }

  async getReservation(id: string): Promise<IReservation> {
    const reservation = await this._reservationRepo.findById(id);
    if (!reservation) throw new Error('Reservation not found');
    return reservation;
  }

  async cancelReservation(id: string): Promise<IReservation> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await this._reservationRepo.findById(id, session);
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.status === ReservationStatus.CANCELLED) throw new Error('Reservation is already cancelled');

      if (reservation.status === ReservationStatus.CONFIRMED) {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new Error('Table type not found or invalid');

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : tableType.price || 0;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(), // Assuming ITransaction.userId is string
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${id}`,
            date: new Date(),
          });
        }
      }

      const updatedReservation = await this._reservationRepo.updateStatus(id, ReservationStatus.CANCELLED);
      if (!updatedReservation) throw new Error('Failed to cancel reservation');
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async confirmReservation(id: string, paymentId: string): Promise<IReservation> {
    const reservation = await this._reservationRepo.findById(id);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.PAYMENT_FAILED) {
      throw new Error(`Reservation cannot be confirmed in current status: ${reservation.status}`);
    }
    const updatedReservation = await this._reservationRepo.update(id, {
      status: ReservationStatus.CONFIRMED,
      paymentId,
      paymentMethod: 'razorpay',
    });
    if (!updatedReservation) throw new Error('Failed to confirm reservation');
    return updatedReservation;
  }

  async failReservation(id: string, paymentId: string): Promise<IReservation> {
    const reservation = await this._reservationRepo.findById(id);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation cannot be updated from current status: ${reservation.status}`);
    }
    const updatedReservation = await this._reservationRepo.update(id, {
      status: ReservationStatus.PAYMENT_FAILED,
      paymentId,
    });
    if (!updatedReservation) throw new Error('Failed to fail reservation');
    return updatedReservation;
  }

  async getAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<any[]> {
    const allTables = await this._tableTypeRepo.findAllByBranch(branchId);
    const availabilityPromises = allTables.map(async (table) => {
      const existingReservations = await this._reservationRepo.findAvailability(
        branchId,
        table._id.toString(),
        date,
        timeSlot
      );
      return existingReservations < table.quantity ? table : null;
    });
    return (await Promise.all(availabilityPromises)).filter((table) => table !== null);
  }

  async getUserReservationsWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    const skip = (page - 1) * limit;
    const [reservations, total] = await Promise.all([
      this._reservationRepo.findByUserIdWithPagination(userId, skip, limit, status),
      this._reservationRepo.countByUserId(userId, status),
    ]);
    return { reservations, total };
  }

  async confirmWithWallet(reservationId: string, userId: string): Promise<IReservation> {
    const reservation = await this._reservationRepo.findById(reservationId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.userId.toString() !== userId) throw new Error('Unauthorized');
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation cannot be confirmed in current status: ${reservation.status}`);
    }

    const tableTypeId = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
      ? (reservation.tableType as ITableType)._id.toString()
      : reservation.tableType.toString();

    const tableType = await this._tableTypeRepo.findById(tableTypeId);
    if (!tableType || !('price' in tableType)) throw new Error('Table type not found or invalid');

    const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : tableType.price || 0;
    await this._walletRepo.payWithWallet(userId, amount, reservationId);
    const updatedReservation = await this._reservationRepo.update(reservationId, {
      status: ReservationStatus.CONFIRMED,
      paymentMethod: 'wallet',
    });
    if (!updatedReservation) throw new Error('Failed to confirm reservation with wallet');
    return updatedReservation;
  }

  async getBranchReservations(
    branchId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    const branch = await this._branchRepo.findById(branchId);
    if (!branch) throw new Error('Branch not found');

    const skip = (page - 1) * limit;
    const [reservations, total] = await Promise.all([
      this._reservationRepo.findByBranchIdWithPagination(branchId, skip, limit, status),
      this._reservationRepo.countByBranchId(branchId, status),
    ]);
    return { reservations, total };
  }

  async updateBranchReservationStatus(
    reservationId: string,
    status: 'completed' | 'cancelled',
    branchId: string
  ): Promise<IReservation | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await this._reservationRepo.findById(reservationId);
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.branch.toString() !== branchId) throw new Error('You do not have permission to update this reservation');
      if (reservation.status !== ReservationStatus.CONFIRMED) {
        throw new Error('Only confirmed reservations can be updated to completed or cancelled');
      }

      let updatedReservation: IReservation | null = null;

      if (status === 'cancelled') {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new Error('Table type not found or invalid');

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : tableType.price || 0;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(), // Assuming ITransaction.userId is string
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${reservationId} by branch`,
            date: new Date(),
          });
        }
      }

      const mappedStatus = status === 'completed' ? ReservationStatus.COMPLETED : ReservationStatus.CANCELLED;
      updatedReservation = await this._reservationRepo.update(reservationId, { status: mappedStatus });
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}