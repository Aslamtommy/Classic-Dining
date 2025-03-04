import { ICouponRepository } from "../interfaces/coupon/ICouponRepository";
import { ICouponService } from "../interfaces/coupon/ICouponService";
import { ICoupon } from "../models/Admin/CouponModel";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { FilterQuery } from "mongoose";
export class CouponService implements ICouponService {  // Fixed typo: CoupenService -> CouponService
  constructor(private _couponRepository: ICouponRepository) {}

  async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
    try {
      if (!couponData.code) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const existingCoupon = await this._couponRepository.findByCode(couponData.code);
      if (existingCoupon) {
        throw new AppError(HttpStatus.Conflict, MessageConstants.COUPON_ALREADY_EXISTS);
      }
      return await this._couponRepository.createCoupon(couponData);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCoupons(page: number, limit: number, searchTerm: string): Promise<{ coupons: ICoupon[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const filter: FilterQuery<ICoupon> = {};
      if (searchTerm) {
        filter.code = { $regex: searchTerm, $options: 'i' };
      }
      const [coupons, total] = await Promise.all([
        this._couponRepository.findAll(filter, skip, limit),
        this._couponRepository.countAll(filter),
      ]);
      return { coupons, total };
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getCouponById(id: string): Promise<ICoupon | null> {
    try {
      const coupon = await this._couponRepository.findById(id);
      if (!coupon) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
      return coupon;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCoupon(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
    try {
      const coupon = await this._couponRepository.update(id, { ...updateData, updatedAt: new Date() });
      if (!coupon) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
      return coupon;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    try {
      const coupon = await this._couponRepository.findById(id);
      if (!coupon) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
      await this._couponRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableCoupons(): Promise<ICoupon[]> {
    try {
      const now = new Date();
      return await this._couponRepository.findAll({ isActive: true, expiryDate: { $gte: now } }, 0, 0);
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}