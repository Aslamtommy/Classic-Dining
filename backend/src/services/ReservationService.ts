import { ReservationRepository } from '../repositories/ReservationRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { ReservationStatus } from '../models/User/Reservation';

export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private branchRepo: BranchRepository,
    private tableTypeRepo: TableTypeRepository
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
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }
    return this.reservationRepo.updateStatus(id, ReservationStatus.CANCELLED);
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
}