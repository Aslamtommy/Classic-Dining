import { ICoupon } from "../models/Admin/CouponModel";
import CouponModel from "../models/Admin/CouponModel";
import { ICouponRepository } from "../interfaces/coupon/ICouponRepository";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { FilterQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository/BaseRepository";
export class CouponRepository extends BaseRepository<ICoupon> implements ICouponRepository {
  constructor() {
    super(CouponModel);
  }
  

  createCoupon = this.create.bind(this);

   
  

  async findByCode(code: string): Promise<ICoupon | null> {
    try {
      return await CouponModel.findOne({ code }).exec();
    } catch (error) {
      console.error('Error in findByCode:', error);
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