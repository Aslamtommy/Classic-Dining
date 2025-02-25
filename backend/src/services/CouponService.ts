import { CouponRepository } from "../repositories/CouponRepository";
import { ICoupon } from "../models/Admin/CouponModel";

export class CoupenService{
    constructor(private  couponRepository:CouponRepository){}

    async createCoupon(couponData:Partial<ICoupon>):Promise<ICoupon>{
        const existingCoupon=await this.couponRepository.findByCode( couponData.code!)
        if (existingCoupon){
            throw new Error ('Coupon already exists')
        }
        return this.couponRepository.createCoupon(couponData)
    }

    async getAllCoupons(page: number, limit: number, searchTerm: string): Promise<{ coupons: ICoupon[]; total: number }> {
        const skip = (page - 1) * limit;
        const filter: any = {};
        if (searchTerm) {
          filter.code = { $regex: searchTerm, $options: 'i' };
        }
        const [coupons, total] = await Promise.all([
          this.couponRepository.findAll(filter, skip, limit),
          this.couponRepository.countAll(filter),
        ]);
        return { coupons, total };
      }

      async getCouponById(id: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        return coupon;
      }

      async updateCoupon(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.update(id, { ...updateData, updatedAt: new Date() });
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        return coupon;
      }

      async deleteCoupon(id: string): Promise<void> {
        const coupon = await this.couponRepository.findById(id);
        if (!coupon) {
          throw new Error('Coupon not found');
        }
        await this.couponRepository.delete(id);
      }

      async getAvailableCoupons():Promise<ICoupon[]>{
      const now=new Date()
      return this.couponRepository.findAll({
      isActive:true,expiryDate:{$gte:now}
      },0,0)
      }
}