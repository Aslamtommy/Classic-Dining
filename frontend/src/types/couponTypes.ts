// src/types.ts
import { Moment } from 'moment';

export interface ICoupon {
  _id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponFormValues {
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: Moment;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  searchTerm: string;
}

export interface ApiResponse {
  data: {
    coupons: ICoupon[];
    total: number;
    page: number;
    limit: number;
  };
}