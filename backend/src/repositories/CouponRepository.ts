import { ICoupon } from "../models/Admin/CouponModel";
import CouponModel from "../models/Admin/CouponModel";
import { ICouponRepository } from "../interfaces/coupon/ICouponRepository";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { FilterQuery } from "mongoose";

export class CouponRepository implements ICouponRepository {
  async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
    try {
      return await CouponModel.create(couponData);
    } catch (error) {
      console.error('Error in createCoupon:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(filter: FilterQuery<ICoupon>, skip: number, limit: number): Promise<ICoupon[]> {
    try {
      return await CouponModel.find(filter).skip(skip).limit(limit).exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<ICoupon | null> {
    try {
      return await CouponModel.findById(id).exec();
    } catch (error) {
      console.error('Error in findById:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    try {
      return await CouponModel.findOne({ code }).exec();
    } catch (error) {
      console.error('Error in findByCode:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    try {
      return await CouponModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (error) {
      console.error('Error in update:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await CouponModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
    } catch (error) {
      console.error('Error in delete:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async countAll(filter: FilterQuery<ICoupon>): Promise<number> {
    try {
      return await CouponModel.countDocuments(filter).exec();
    } catch (error) {
      console.error('Error in countAll:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}