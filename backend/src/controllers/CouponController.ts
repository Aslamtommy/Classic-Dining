import { Request, Response } from 'express';
import { ICouponService } from '../interfaces/coupon/ICouponService';
import { HttpStatus } from '../constants/HttpStatus';
import { sendResponse, sendError } from '../utils/responseUtils';

export class CouponController {
  constructor(private  _couponService: ICouponService) {}

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const couponData = req.body;
      const coupon = await this. _couponService.createCoupon(couponData);
      sendResponse(res, HttpStatus.Created , 'Coupon created successfully', coupon);
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.searchTerm as string || '';
      const { coupons, total } = await this. _couponService.getAllCoupons(page, limit, searchTerm);
      sendResponse(res, HttpStatus.OK, 'Coupons retrieved successfully', { coupons, total, page, limit });
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const coupon = await this. _couponService.getCouponById(id);
      sendResponse(res, HttpStatus.OK, 'Coupon retrieved successfully', coupon);
    } catch (error: any) {
      sendError(res, HttpStatus.NotFound, error.message);
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const updatedCoupon = await this. _couponService.updateCoupon(id, updateData);
      sendResponse(res, HttpStatus.OK, 'Coupon updated successfully', updatedCoupon);
    } catch (error: any) {
      sendError(res, HttpStatus.NotFound, error.message);
    }
  }

  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      await this. _couponService.deleteCoupon(id);
      sendResponse(res, HttpStatus.OK, 'Coupon deleted successfully');
    } catch (error: any) {
      sendError(res, HttpStatus.NotFound, error.message);
    }
  }
}