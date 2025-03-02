import { ICoupon } from "../../models/Admin/CouponModel";

export interface ICouponService {
  createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon>;
  getAllCoupons(page: number, limit: number, searchTerm: string): Promise<{ coupons: ICoupon[]; total: number }>;
  getCouponById(id: string): Promise<ICoupon | null>;
  updateCoupon(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  deleteCoupon(id: string): Promise<void>;
  getAvailableCoupons(): Promise<ICoupon[]>;
}