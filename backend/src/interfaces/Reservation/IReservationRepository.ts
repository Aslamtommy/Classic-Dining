// src/interfaces/reservation/IReservationRepository.ts
import { IReservation } from '../../models/User/Reservation';
import { ReservationStatus } from '../../models/User/Reservation';
 
import { ClientSession } from "mongoose";

export interface IReservationRepository {
  create(reservationData: Partial<IReservation>): Promise<IReservation>;
  findById(id: string, session?: ClientSession): Promise<IReservation | null>;
  updateStatus(id: string, status: 'confirmed' | 'cancelled' | 'payment_failed'): Promise<IReservation | null>;
  update(id: string, updateData: Partial<IReservation>): Promise<IReservation | null>;
  findAvailability(branchId: string, tableTypeId: string, date: Date, timeSlot: string): Promise<number>;
  findAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<string[]>;
  findExpiredPendingReservations(timeoutMinutes: number): Promise<IReservation[]>;
  findByUserId(userId: string): Promise<IReservation[]>;
  findByBranchIdWithPagination(
    branchId: string,
    skip: number,
    limit: number,
    status?: ReservationStatus
  ): Promise<IReservation[]>;
  countByBranchId(branchId: string, status?: ReservationStatus): Promise<number>;
  findByUserIdWithPagination(
    userId: string,
    skip: number,
    limit: number,
    status?: ReservationStatus
  ): Promise<IReservation[]>;
  countByUserId(userId: string, status?: ReservationStatus): Promise<number>;
  getReservedQuantity(branchId: string, tableTypeId: string, date: Date, timeSlot: string): Promise<number>
}
