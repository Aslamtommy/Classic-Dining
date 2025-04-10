import { Types } from 'mongoose';
import Reservation from '../models/User/Reservation';
import RestaurentModel from '../models/Restaurent/restaurentModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export interface Reservation {
  _id: string;
  branchName: string;
  reservationDate: string;
  timeSlot: string;
  status: string;
  amount: number;
}

export interface BranchReservations {
  branchId: string;
  branchName: string;
  reservations: Reservation[];
}

export interface MainDashboardData {
  totalBranches: number;
  totalReservations: number;
  totalRevenue: number;
  reservationTrends: Array<{ date: string; count: number }>;
  branchReservations: BranchReservations[];
}

export class MainDashboardRepository {
  async getDashboardData(restaurentId: string, filter: '7days' | '30days' | 'month' | 'year' = '30days'): Promise<MainDashboardData> {
    try {
      const restaurant = await RestaurentModel.findById(restaurentId).select('branches').lean().exec();
      if (!restaurant) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESTAURANT_NOT_FOUND);
      }
      if (!restaurant || !restaurant.branches || restaurant.branches.length === 0) {
        throw new AppError(HttpStatus.NotFound,  'Branches not found');
      }
      

      const branchIds = restaurant.branches.map((id) => new Types.ObjectId(id.toString()));
      let startDate = new Date();

      // Calculate start date based on filter
      switch (filter) {
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30); // Default to 30 days
      }

      const dashboardData = await Reservation.aggregate([
        { $match: { branch: { $in: branchIds }, reservationDate: { $gte: startDate } } },
        {
          $facet: {
            totalReservations: [{ $count: 'count' }],
            totalRevenue: [
              { $match: { status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$finalAmount' } } },
            ],
            reservationTrends: [
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$reservationDate' } },
                  count: { $sum: 1 },
                },
              },
              { $sort: { '_id': 1 } },
              { $project: { date: '$_id', count: 1, _id: 0 } },
            ],
            branchReservations: [
              {
                $group: {
                  _id: '$branch',
                  reservations: {
                    $push: {
                      _id: '$_id',
                      reservationDate: '$reservationDate',
                      timeSlot: '$timeSlot',
                      status: '$status',
                      amount: '$finalAmount',
                    },
                  },
                },
              },
              {
                $lookup: {
                  from: 'branches',
                  localField: '_id',
                  foreignField: '_id',
                  as: 'branch',
                },
              },
              { $unwind: '$branch' },
              {
                $project: {
                  branchId: '$_id',
                  branchName: '$branch.name',
                  reservations: { $slice: ['$reservations', 10] }, // Limit to 10 per branch
                },
              },
            ],
          },
        },
      ]);

      const totalReservations = dashboardData[0].totalReservations[0]?.count || 0;
      const totalRevenue = dashboardData[0].totalRevenue[0]?.total || 0;
      const reservationTrends = dashboardData[0].reservationTrends;
      const branchReservations = dashboardData[0].branchReservations;

      return {
        totalBranches: branchIds.length,
        totalReservations,
        totalRevenue,
        reservationTrends,
        branchReservations,
      };
    } catch (error) {
      console.error('Error in MainDashboardRepository:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}