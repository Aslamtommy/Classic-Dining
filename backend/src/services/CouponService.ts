 
import { ICouponRepository } from "../interfaces/coupon/ICouponRepository";
 import { ICouponService } from "../interfaces/coupon/ICouponService";
import { ICoupon } from "../models/Admin/CouponModel";

export class CoupenService implements ICouponService{
    constructor(private  _couponRepository:ICouponRepository){}

    async createCoupon(couponData:Partial<ICoupon>):Promise<ICoupon>{
        const existingCoupon=await this. _couponRepository.findByCode( couponData.code!)
        if (existingCoupon){
            throw new Error ('Coupon already exists')
        }
        return this. _couponRepository.createCoupon(couponData)
    }

    async getAllCoupons(page: number, limit: number, searchTerm: string): Promise<{ coupons: ICoupon[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = {};
        if (searchTerm) {
          filter.code = { $regex: searchTerm, $options: 'i' };
        }
        const [coupons, total] = await Promise.all([
          this. _couponRepository.findAll(filter, skip, limit),
          this. _couponRepository.countAll(filter),
        ]);
        return { coupons, total };
      }

      async getCouponById(id: string): Promise<ICoupon | null> {
        const coupon = await this. _couponRepository.findById(id);
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        return coupon;
      }

      async updateCoupon(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        const coupon = await this. _couponRepository.update(id, { ...updateData, updatedAt: new Date() });
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        return coupon;
      }

      async deleteCoupon(id: string): Promise<void> {
        const coupon = await this. _couponRepository.findById(id);
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        await this. _couponRepository.delete(id);
      }

      async getAvailableCoupons():Promise<ICoupon[]>{
      const now=new Date()
      return this. _couponRepository.findAll({
      isActive:true,expiryDate:{$gte:now}
      },0,0)
      }
}