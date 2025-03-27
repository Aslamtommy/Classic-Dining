 
import { IReservation } from '../../models/User/Reservation';
import { ReservationStatus } from '../../models/User/Reservation';
import { ITableType } from '../../models/Restaurent/TableModel'; // Import ITableType
import { IReview } from '../../models/User/Reservation';
export interface IReservationService {
    createReservation(reservationData: Partial<IReservation>): Promise<IReservation>;
    getReservation(id: string): Promise<IReservation>;
    cancelReservation(id: string): Promise<IReservation>;
    confirmReservation(id: string, paymentId: string): Promise<IReservation>;
    failReservation(id: string, paymentId: string): Promise<IReservation>;
    getAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<ITableType[]>; // Changed from any[] to ITableType[]
    getUserReservationsWithPagination(
        userId: string,
        page: number,
        limit: number,
        status?: ReservationStatus
    ): Promise<{ reservations: IReservation[]; total: number }>;
    confirmWithWallet(reservationId: string, userId: string): Promise<IReservation>;
    getBranchReservations(
        branchId: string,
        page: number,
        limit: number,
        status?: ReservationStatus
    ): Promise<{ reservations: IReservation[]; total: number }>;
    updateBranchReservationStatus(
        reservationId: string,
        status: 'completed' | 'cancelled',
        branchId: string
    ): Promise<IReservation | null>;
    submitReview(reservationId: string, userId: string, review: { rating: number; comment?: string }): Promise<IReservation> 
    getBranchReviews(branchId: string): Promise<IReview[]> 
}