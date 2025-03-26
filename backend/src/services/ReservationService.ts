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
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class ReservationService implements IReservationService {
  constructor(
    private _reservationRepo: IReservationRepository,
    private _branchRepo: IBranchRepository,
    private _tableTypeRepo: TableTypeRepository,
    private _walletRepo: IWalletRepository,
    private _couponRepo: ICouponRepository
  ) {}

  async createReservation(reservationData: Partial<IReservation>): Promise<IReservation> {
    try {
      const branchId = reservationData.branch?._id?.toString();
      const tableTypeId = reservationData.tableType?._id?.toString();
      if (!branchId || !tableTypeId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);

      const [branch, tableType] = await Promise.all([
        this._branchRepo.findById(branchId),
        this._tableTypeRepo.findById(tableTypeId),
      ]);

      if (!branch || !tableType) throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_BRANCH_OR_TABLE);

      const partySize = reservationData.partySize || 0;
      const tableQuantity = Math.ceil(partySize / tableType.capacity); // Handle large groups

      const reservedQuantity = await this._reservationRepo.getReservedQuantity(
        branchId,
        tableTypeId,
        reservationData.reservationDate as Date,
        reservationData.timeSlot as string
      );

      if (reservedQuantity + tableQuantity > tableType.quantity) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.NO_AVAILABLE_TABLES);
      }

      let discountApplied = 0;
      let finalAmount = (tableType.price || 0) * tableQuantity;

      if (reservationData.couponCode) {
        const coupon = await this._couponRepo.findByCode(reservationData.couponCode);
        if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
          throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_COUPON);
        }
        if (coupon.minOrderAmount && finalAmount < coupon.minOrderAmount) {
          throw new AppError(HttpStatus.BadRequest, `${MessageConstants.MIN_ORDER_AMOUNT_REQUIRED} ${coupon.minOrderAmount}`);
        }
        discountApplied = coupon.discountType === 'percentage'
          ? Math.min((coupon.discount / 100) * finalAmount, coupon.maxDiscountAmount || Infinity)
          : coupon.discount;
        finalAmount -= discountApplied;
        if (finalAmount < 0) finalAmount = 0;
      }

      const reservation = await this._reservationRepo.create({
        ...reservationData,
        tableQuantity,
        preferences: reservationData.preferences || [],
        couponCode: reservationData.couponCode,
        discountApplied,
        finalAmount,
        branch: new Types.ObjectId(branchId),
        tableType: new Types.ObjectId(tableTypeId),
      });

      return reservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getReservation(id: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      return reservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelReservation(id: string): Promise<IReservation> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.status === ReservationStatus.CANCELLED) throw new AppError(HttpStatus.BadRequest, MessageConstants.RESERVATION_ALREADY_CANCELLED);

      if (reservation.status === ReservationStatus.CONFIRMED) {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INVALID_BRANCH_OR_TABLE);

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(),
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${id}`,
            date: new Date(),
          });
        }
      }

      const updatedReservation = await this._reservationRepo.update(id, { status: ReservationStatus.CANCELLED });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }

  async confirmReservation(id: string, paymentId: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.PAYMENT_FAILED) {
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }
      const updatedReservation = await this._reservationRepo.update(id, {
        status: ReservationStatus.CONFIRMED,
        paymentId,
        paymentMethod: 'razorpay',
      });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      return updatedReservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async failReservation(id: string, paymentId: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.status !== ReservationStatus.PENDING) {
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }
      const updatedReservation = await this._reservationRepo.update(id, {
        status: ReservationStatus.PAYMENT_FAILED,
        paymentId,
      });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      return updatedReservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<ITableType[]> {
    try {
      const allTables = await this._tableTypeRepo.findAllByBranch(branchId);
      const availabilityPromises = allTables.map(async (table) => {
        const reservedQuantity = await this._reservationRepo.getReservedQuantity(
          branchId,
          table._id.toString(),
          date,
          timeSlot
        );
        return reservedQuantity < table.quantity ? table : null;
      });
      return (await Promise.all(availabilityPromises)).filter((table): table is ITableType => table !== null);
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserReservationsWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [reservations, total] = await Promise.all([
        this._reservationRepo.findByUserIdWithPagination(userId, skip, limit, status),
        this._reservationRepo.countByUserId(userId, status),
      ]);
      return { reservations, total };
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async confirmWithWallet(reservationId: string, userId: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(reservationId);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.userId.toString() !== userId) throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      if (reservation.status !== ReservationStatus.PENDING) {
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }

      const tableTypeId = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
        ? (reservation.tableType as ITableType)._id.toString()
        : reservation.tableType.toString();

      const tableType = await this._tableTypeRepo.findById(tableTypeId);
      if (!tableType || !('price' in tableType)) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INVALID_BRANCH_OR_TABLE);

      const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;
      await this._walletRepo.payWithWallet(userId, amount, reservationId);
      const updatedReservation = await this._reservationRepo.update(reservationId, {
        status: ReservationStatus.CONFIRMED,
        paymentMethod: 'wallet',
      });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      return updatedReservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.WALLET_CONFIRMATION_FAILED);
    }
  }

  async getBranchReservations(
    branchId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    try {
      const branch = await this._branchRepo.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);

      const skip = (page - 1) * limit;
      const [reservations, total] = await Promise.all([
        this._reservationRepo.findByBranchIdWithPagination(branchId, skip, limit, status),
        this._reservationRepo.countByBranchId(branchId, status),
      ]);
      return { reservations, total };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
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
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.branch.toString() !== branchId) throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      if (reservation.status !== ReservationStatus.CONFIRMED) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_RESERVATION_STATUS);
      }

      let updatedReservation: IReservation | null = null;

      if (status === 'cancelled') {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INVALID_BRANCH_OR_TABLE);

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(),
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${reservationId} by branch`,
            date: new Date(),
          });
        }
      }

      const mappedStatus = status === 'completed' ? ReservationStatus.COMPLETED : ReservationStatus.CANCELLED;
      updatedReservation = await this._reservationRepo.update(reservationId, { status: mappedStatus });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }
}