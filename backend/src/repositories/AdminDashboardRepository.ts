// src/repositories/AdminDashboardRepository.ts
import { IAdminDashboardRepository } from "../interfaces/admin/IAdminDashboardRepository";
import Reservation from "../models/User/Reservation";
import RestaurentModel from "../models/Restaurent/restaurentModel";
import BranchModel from "../models/Restaurent/Branch/BranchModel";
import User from "../models/User/userModel";
import { ReservationStatus } from "../models/User/Reservation";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class AdminDashboardRepository implements IAdminDashboardRepository {
  async getTotalRevenue(dateFilter: any, restaurantId?: string, branchId?: string): Promise<number> {
    try {
      const match: any = { status: ReservationStatus.COMPLETED };
      if (restaurantId) match["branch.parentRestaurant"] = restaurantId;
      if (branchId) match.branch = branchId;
      if (dateFilter.$gte) match.reservationDate = dateFilter;

      const result = await Reservation.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]).exec();
      return result[0]?.total || 0;
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getReservationStats(dateFilter: any, restaurantId?: string, branchId?: string): Promise<{ pending: number; confirmed: number; completed: number; cancelled: number }> {
    try {
      const match: any = {};
      if (restaurantId) match["branch.parentRestaurant"] = restaurantId;
      if (branchId) match.branch = branchId;
      if (dateFilter.$gte) match.reservationDate = dateFilter;

      const stats = await Reservation.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]).exec();

      const result = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      stats.forEach((stat) => (result[stat._id as keyof typeof result] = stat.count));
      return result;
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getReservationTrends(dateFilter: any, filter: "daily" | "monthly" | "yearly", restaurantId?: string, branchId?: string): Promise<Array<{ date: string; count: number; revenue: number }>> {
    try {
      const groupFormat = filter === "yearly" ? "%Y" : filter === "monthly" ? "%Y-%m" : "%Y-%m-%d";
      const match: any = { status: ReservationStatus.COMPLETED };
      if (restaurantId) match["branch.parentRestaurant"] = restaurantId;
      if (branchId) match.branch = branchId;
      if (dateFilter.$gte) match.reservationDate = dateFilter;

      const trends = await Reservation.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: "$reservationDate" } },
            count: { $sum: 1 },
            revenue: { $sum: "$finalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]).exec();

      return trends.map((trend) => ({ date: trend._id, count: trend.count, revenue: trend.revenue }));
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getTopRestaurants(dateFilter: any, restaurantId?: string): Promise<Array<{ _id: string; name: string; revenue: number; reservations: number }>> {
    try {
      const match: any = { status: ReservationStatus.COMPLETED };
      if (restaurantId) match["branch.parentRestaurant"] = restaurantId;
      if (dateFilter.$gte) match.reservationDate = dateFilter;

      return await Reservation.aggregate([
        { $match: match },
        { $lookup: { from: "branches", localField: "branch", foreignField: "_id", as: "branch" } },
        { $unwind: "$branch" },
        { $group: { _id: "$branch.parentRestaurant", revenue: { $sum: "$finalAmount" }, reservations: { $sum: 1 } } },
        { $lookup: { from: "restaurents", localField: "_id", foreignField: "_id", as: "restaurant" } },
        { $unwind: "$restaurant" },
        { $project: { _id: "$_id", name: "$restaurant.name", revenue: 1, reservations: 1 } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]).exec();
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getBranchActivity(dateFilter: any, restaurantId?: string, branchId?: string): Promise<Array<{ _id: string; name: string; reservations: number }>> {
    try {
      const match: any = {};
      if (restaurantId) match.parentRestaurant = restaurantId;
      if (branchId) match._id = branchId;

      return await BranchModel.aggregate([
        { $match: match },
        { $lookup: { from: "reservations", localField: "_id", foreignField: "branch", as: "reservations" } },
        { $unwind: { path: "$reservations", preserveNullAndEmptyArrays: true } },
        { $match: { "reservations.status": ReservationStatus.COMPLETED, ...(dateFilter.$gte && { "reservations.reservationDate": dateFilter }) } },
        { $group: { _id: "$_id", name: { $first: "$name" }, reservations: { $sum: 1 } } },
        { $sort: { reservations: -1 } },
        { $limit: 5 },
      ]).exec();
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingApprovals(): Promise<number> {
    try {
      return await RestaurentModel.countDocuments({ isApproved: false }).exec();
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getTopCustomers(dateFilter: any, restaurantId?: string, branchId?: string): Promise<Array<{ _id: string; name: string; email: string; totalBookings: number; totalSpent: number }>> {
    try {
      const match: any = { status: ReservationStatus.COMPLETED };
      if (restaurantId) match["branch.parentRestaurant"] = restaurantId;
      if (branchId) match.branch = branchId;
      if (dateFilter.$gte) match.reservationDate = dateFilter;

      return await Reservation.aggregate([
        { $match: match },
        { $group: { _id: "$userId", totalBookings: { $sum: 1 }, totalSpent: { $sum: "$finalAmount" } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { _id: "$_id", name: "$user.name", email: "$user.email", totalBookings: 1, totalSpent: 1 } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
      ]).exec();
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserGrowth(dateFilter: any, filter: "daily" | "monthly" | "yearly"): Promise<Array<{ date: string; count: number }>> {
    try {
      const groupFormat = filter === "yearly" ? "%Y" : filter === "monthly" ? "%Y-%m" : "%Y-%m-%d";
      const match = dateFilter.$gte ? { createdAt: dateFilter } : {};

      const growth = await User.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: groupFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).exec();

      return growth.map((g) => ({ date: g._id, count: g.count }));
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getSystemHealth(dateFilter: any, restaurantId?: string, branchId?: string): Promise<{ pendingIssues: number; couponUsage: Array<{ code: string; timesUsed: number; totalDiscount: number }> }> {
    try {
      const matchIssues: any = { status: ReservationStatus.PAYMENT_FAILED };
      if (restaurantId) matchIssues["branch.parentRestaurant"] = restaurantId;
      if (branchId) matchIssues.branch = branchId;
      if (dateFilter.$gte) matchIssues.reservationDate = dateFilter;

      const [pendingIssues, couponUsage] = await Promise.all([
        Reservation.countDocuments(matchIssues).exec(),
        Reservation.aggregate([
          { $match: { couponCode: { $ne: null }, ...(dateFilter.$gte && { reservationDate: dateFilter }), ...(restaurantId && { "branch.parentRestaurant": restaurantId }), ...(branchId && { branch: branchId }) } },
          { $group: { _id: "$couponCode", timesUsed: { $sum: 1 }, totalDiscount: { $sum: "$discountApplied" } } },
          { $project: { code: "$_id", timesUsed: 1, totalDiscount: 1 } },
        ]).exec(),
      ]);

      return { pendingIssues, couponUsage };
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getOverviewCounts(restaurantId?: string, branchId?: string): Promise<{ totalReservations: number; activeRestaurants: number; activeBranches: number; userCount: number }> {
    try {
      const matchReservations: any = {};
      if (restaurantId) matchReservations["branch.parentRestaurant"] = restaurantId;
      if (branchId) matchReservations.branch = branchId;

      const [totalReservations, activeRestaurants, activeBranches, userCount] = await Promise.all([
        Reservation.countDocuments(matchReservations).exec(),
        RestaurentModel.countDocuments({ isApproved: true, isBlocked: false, ...(restaurantId && { _id: restaurantId }) }).exec(),
        BranchModel.countDocuments(branchId ? { _id: branchId } : {}).exec(),
        User.countDocuments({}).exec(),
      ]);

      return { totalReservations, activeRestaurants, activeBranches, userCount };
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}