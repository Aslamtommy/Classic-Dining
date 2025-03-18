// src/repositories/BranchDashboardRepository.ts
import mongoose from 'mongoose';
import Reservation, { ReservationStatus } from '../models/User/Reservation';
import TableType from '../models/Restaurent/TableModel';
import User from '../models/User/userModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class BranchDashboardRepository {
  async getReservationStats(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId) };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  }

  async getRevenueStats(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId) };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([{ $match: match }, { $group: { _id: '$status', totalAmount: { $sum: '$finalAmount' } } }]);
  }

  async getReservationTrends(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId), status: ReservationStatus.COMPLETED };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$reservationDate' } }, count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTableUtilization(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId), status: ReservationStatus.COMPLETED };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([{ $match: match }, { $group: { _id: '$tableType', totalBookings: { $sum: 1 } } }]);
  }

  async getTopCustomers(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId), status: ReservationStatus.COMPLETED };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([
      { $match: match },
      { $group: { _id: '$userId', totalBookings: { $sum: 1 }, totalSpent: { $sum: '$finalAmount' } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { userId: '$_id', name: '$user.name', totalBookings: 1, totalSpent: 1 } },
    ]);
  }

  async getCouponUsage(branchId: string, dateFilter?: { $gte: Date; $lte: Date }): Promise<any> {
    const match: any = { branch: new mongoose.Types.ObjectId(branchId), couponCode: { $ne: null } };
    if (dateFilter) match.reservationDate = dateFilter;
    return await Reservation.aggregate([
      { $match: match },
      { $group: { _id: '$couponCode', timesUsed: { $sum: 1 }, totalDiscount: { $sum: '$discountApplied' } } },
      { $sort: { timesUsed: -1 } },
    ]);
  }
}