 import { ICoupon } from "../../models/Admin/CouponModel";
import { FilterQuery } from "mongoose";

export interface ICouponRepository {
  createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon>;
  findAll(filter: FilterQuery<ICoupon>, skip: number, limit: number): Promise<ICoupon[]>;
  findById(id: string): Promise<ICoupon | null>;
  findByCode(code: string): Promise<ICoupon | null>;
  update(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  delete(id: string): Promise<void>;
  countAll(filter: FilterQuery<ICoupon>): Promise<number>;
}