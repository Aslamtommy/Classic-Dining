import { ICoupon } from "../models/Admin/CouponModel";
import CouponModel from "../models/Admin/CouponModel";

export class CouponRepository{
    async createCoupon(couponData:Partial<ICoupon>):Promise<ICoupon>{
        return CouponModel.create(couponData)
    }

    async findAll(filter :any,skip:number,limit:number):Promise<ICoupon[]>{
        return CouponModel.find(filter).skip(skip).limit(limit).exec()
    }
    async findById(Id:string):Promise<ICoupon | null>{
        return CouponModel.findById(Id)
    }

    async findByCode(code:string):Promise<ICoupon | null>{
        return CouponModel.findOne({code})
    }
    async update(id: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        return CouponModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
      }
      async delete(id: string): Promise<void> {
        await CouponModel.findByIdAndDelete(id).exec();
      }
      async countAll(filter: any): Promise<number> {
        return CouponModel.countDocuments(filter).exec();
      }
}