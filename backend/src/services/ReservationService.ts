import { ReservationRepository } from '../repositories/ReservationRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { ReservationStatus } from '../models/User/Reservation';
import { WalletRepository } from '../repositories/WalletRepository';
import { IReservation } from '../models/User/Reservation';
import mongoose from 'mongoose';
export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private branchRepo: BranchRepository,
    private tableTypeRepo: TableTypeRepository,
    private walletRepo: WalletRepository
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

    return this.reservationRepo.create(reservationData);
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

      // If reservation is confirmed, credit the wallet
      if (reservation.status === ReservationStatus.CONFIRMED) {
        const tableTypeId = typeof reservation.tableType === 'object' && reservation.tableType !== null
          ? reservation.tableType._id.toString()
          : reservation.tableType;
        const tableType = await this.tableTypeRepo.findById(tableTypeId,  );
        if (!tableType) throw new Error('Table type not found');

        const amount = tableType.price || 0;
        if (amount > 0) {
          await this.walletRepo.updateWalletBalance(reservation.userId.toString(), amount, );
          await this.walletRepo.createTransaction({
            userId: reservation.userId,
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation  `,
            date: new Date(),
          },  );
        }
      }

      updatedReservation = await this.reservationRepo.updateStatus(id, ReservationStatus.CANCELLED );
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
    return this.reservationRepo.update(id, { status: ReservationStatus.CONFIRMED, paymentId });
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

  async getUserReservations(userId:string){
    const reservations=await this.reservationRepo.findByUserId(userId)
    return reservations
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

    // Extract tableType ID correctly whether populated or not
    const tableTypeId = typeof reservation.tableType === 'object' && reservation.tableType !== null
      ? reservation.tableType._id.toString()
      : reservation.tableType 

    const tableType = await this.tableTypeRepo.findById(tableTypeId);
    if (!tableType) throw new Error('Table type not found');

    const amount = tableType.price || 0;
    await this.walletRepo.payWithWallet(userId, amount, reservationId);
    return this.reservationRepo.update(reservationId, {
      status: ReservationStatus.CONFIRMED,
      paymentMethod: 'wallet',
    });
  }
}