import { ReservationRepository } from '../repositories/ReservationRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { ReservationStatus } from '../models/User/Reservation';
import { WalletRepository } from '../repositories/WalletRepository';
import { IReservation } from '../models/User/Reservation';
import { CouponRepository } from '../repositories/CouponRepository';
import mongoose from 'mongoose';

export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private branchRepo: BranchRepository,
    private tableTypeRepo: TableTypeRepository,
    private walletRepo: WalletRepository,
    private couponRepo: CouponRepository
  ) {}

  async createReservation(reservationData: any) {
    const [branch, tableType] = await Promise.all([
      this.branchRepo.findById(reservationData.branch),
      this.tableTypeRepo.findById(reservationData.tableType),
    ]);

    if (!branch || !tableType) {
      throw new Error('Invalid branch or table type');
    }

    if (reservationData.partySize > tableType.capacity) {
      throw new Error(`Party size exceeds table capacity. Maximum capacity: ${tableType.capacity}`);
    }

    const existingReservations = await this.reservationRepo.findAvailability(
      reservationData.branch,
      reservationData.tableType,
      reservationData.reservationDate,
      reservationData.timeSlot
    );

    if (existingReservations >= tableType.quantity) {
      throw new Error('No available tables for selected time slot');
    }

    let discountApplied = 0;
    let finalAmount = tableType.price || 0;

    // Coupon logic
    if (reservationData.couponCode) {
      const coupon = await this.couponRepo.findByCode(reservationData.couponCode);
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
      if (finalAmount < 0) finalAmount = 0; // Ensure non-negative final amount
    }

    const reservation = await this.reservationRepo.create({
      ...reservationData,
      couponCode: reservationData.couponCode,
      discountApplied,
      finalAmount,
    });

    return reservation;
  }

  async getReservation(id: string) {
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    return reservation;
  }

  async cancelReservation(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await this.reservationRepo.findById(id, session);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new Error('Reservation is already cancelled');
      }

      let updatedReservation: IReservation | null = null;

      // If reservation is confirmed, credit the wallet with finalAmount
      if (reservation.status === ReservationStatus.CONFIRMED) {
        const tableType = typeof reservation.tableType === 'object' && reservation.tableType !== null
          ? reservation.tableType
          : await this.tableTypeRepo.findById(reservation.tableType ,  );

        if (!tableType) throw new Error('Table type not found');

        const amount = reservation.finalAmount !== undefined
          ? reservation.finalAmount
          : (tableType as any).price || 0; // Cast to any temporarily, ideally type-safe

        if (amount > 0) {
          await this.walletRepo.updateWalletBalance(reservation.userId.toString(), amount, );
          await this.walletRepo.createTransaction({
            userId: reservation.userId,
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${id}`,
            date: new Date(),
          },  );
        }
      }

      updatedReservation = await this.reservationRepo.updateStatus(id, ReservationStatus.CANCELLED,  );
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async confirmReservation(id: string, paymentId: string) {
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    if (
      reservation.status !== ReservationStatus.PENDING &&
      reservation.status !== ReservationStatus.PAYMENT_FAILED
    ) {
      throw new Error(`Reservation cannot be confirmed in current status: ${reservation.status}`);
    }
    return this.reservationRepo.update(id, { status: ReservationStatus.CONFIRMED, paymentId, paymentMethod: 'razorpay' });
  }

  async failReservation(id: string, paymentId: string) {
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation cannot be updated from current status: ${reservation.status}`);
    }
    return this.reservationRepo.update(id, { status: ReservationStatus.PAYMENT_FAILED, paymentId });
  }

  async getAvailableTables(branchId: string, date: Date, timeSlot: string) {
    const allTables = await this.tableTypeRepo.findAllByBranch(branchId);

    const availabilityPromises = allTables.map(async (table) => {
      const existingReservations = await this.reservationRepo.findAvailability(
        branchId,
        table._id.toString(),
        date,
        timeSlot
      );
      return existingReservations < table.quantity ? table : null;
    });

    const availableTables = (await Promise.all(availabilityPromises)).filter((table) => table !== null);
    return availableTables;
  }

  async getUserReservations(userId: string) {
    const reservations = await this.reservationRepo.findByUserId(userId);
    return reservations;
  }

  async confirmWithWallet(reservationId: string, userId: string): Promise<any> {
    const reservation = await this.reservationRepo.findById(reservationId);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    if (reservation.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation cannot be confirmed in current status: ${reservation.status}`);
    }

    const tableTypeId = typeof reservation.tableType === 'object' && reservation.tableType !== null
      ? reservation.tableType._id.toString()
      : reservation.tableType;

    const tableType = await this.tableTypeRepo.findById(tableTypeId);
    if (!tableType) throw new Error('Table type not found');

    // Use finalAmount if coupon applied, otherwise use price
    const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : tableType.price || 0;
    await this.walletRepo.payWithWallet(userId, amount, reservationId);
    return this.reservationRepo.update(reservationId, {
      status: ReservationStatus.CONFIRMED,
      paymentMethod: 'wallet',
    });
  }


  //Branchside management
  async getBranchReservations(branchId: string): Promise<IReservation[]> {
 const branch=await this.branchRepo.findById(branchId)
     if (!branch) throw new Error('Branch not found');
     return this.reservationRepo.findByBranchId(branchId)
  }
}