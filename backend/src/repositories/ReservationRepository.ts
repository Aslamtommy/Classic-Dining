// repositories/ReservationRepository.ts
import { IReservation } from '../models/User/Reservation';
import Reservation from '../models/User/Reservation';
import { ReservationStatus } from '../models/User/Reservation';
export class ReservationRepository {
  async create(reservationData: Partial<IReservation>): Promise<IReservation> {
    return Reservation.create(reservationData);
  }

  async findById(id: string): Promise<IReservation | null> {
    return Reservation.findById(id)
      .populate('branch')
      .populate('tableType')
      .exec();
  }

  async updateStatus(id: string, status: 'confirmed' | 'cancelled' | 'payment_failed'): Promise<IReservation | null> {
    return Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  async update(id: string, updateData: Partial<IReservation>): Promise<IReservation | null> {
    return Reservation.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async findAvailability(branchId: string, tableTypeId: string, date: Date, timeSlot: string): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const query = {
      branch: branchId,
      tableType: tableTypeId,
      reservationDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      timeSlot,
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] }, 
    };

    const existingReservations = await Reservation.countDocuments(query);
    return existingReservations;
  }

  async findAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<string[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const query = {
      branch: branchId,
      reservationDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      timeSlot,
      status: { $in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
    };

    const reservations = await Reservation.find(query).select('tableType').exec();
    const reservedTableIds = reservations.map((res) => res.tableType.toString());
    return reservedTableIds;
  }
async findExpiredPendingReservations(timeoutMinutes: number):Promise<IReservation[]>{
  const timeoutDate=new Date(Date.now()-timeoutMinutes*60*1000)
  return Reservation.find({
    status:ReservationStatus.PENDING,
    createdAt:{$lt:timeoutDate},
  }).exec()
}

 
async findByUserId(userId: string): Promise<IReservation[]> {
  return Reservation.find({ userId })
    .populate('branch', 'name') // Populate branch name
    .populate('tableType', 'name capacity price') // Populate table details
    .sort({ reservationDate: -1 }) // Sort by date, newest first
    .exec();
}
}