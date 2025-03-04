import { Request, Response } from 'express';
import { ICouponService } from '../interfaces/coupon/ICouponService';
import { HttpStatus } from '../constants/HttpStatus';
import { sendResponse, sendError } from '../utils/responseUtils';
import { AppError } from '../utils/AppError';
import { MessageConstants } from '../constants/MessageConstants';

export class CouponController {
  constructor(private _couponService: ICouponService) {}

  async createCoupon(req: Request, res: Response): Promise<void> {
    try {
      const couponData = req.body;
      if (!couponData.code) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const coupon = await this._couponService.createCoupon(couponData);
      sendResponse(res, HttpStatus.Created, MessageConstants.COUPON_CREATED, coupon);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.searchTerm as string || '';
      const { coupons, total } = await this._couponService.getAllCoupons(page, limit, searchTerm);
      sendResponse(res, HttpStatus.OK, MessageConstants.COUPONS_FETCHED, { coupons, total, page, limit });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getCouponById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const coupon = await this._couponService.getCouponById(id);
      if (!coupon) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.COUPONS_FETCHED, coupon);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      const updateData = req.body;
      const updatedCoupon = await this._couponService.updateCoupon(id, updateData);
      if (!updatedCoupon) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.COUPON_NOT_FOUND);
      }
      sendResponse(res, HttpStatus.OK, MessageConstants.COUPON_UPDATED, updatedCoupon);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteCoupon(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      if (!id) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }
      await this._couponService.deleteCoupon(id);
      sendResponse(res, HttpStatus.OK, MessageConstants.COUPON_DELETED);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}