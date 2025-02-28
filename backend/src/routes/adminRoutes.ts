import express, { Router, Request, Response } from 'express';

import { authenticateToken } from '../middlewares/authentication';
import AdminController from '../controllers/AdminController';
 import AdminService from '../services/AdminService';
 import { AdminRepository } from '../repositories/AdminRepository';
import { RestaurentRepository } from '../repositories/RestaurentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { CoupenService } from '../services/CouponService';
import { CouponController } from '../controllers/CouponController';
import { CouponRepository } from '../repositories/CouponRepository';
const adminRoute:Router=express.Router();

const restaurentRepository=new RestaurentRepository()
const userRepository=new UserRepository()
const adminRepository=new AdminRepository()
const adminService=new AdminService(adminRepository,restaurentRepository,userRepository)
const adminController=new AdminController(adminService)
const couponRepository = new CouponRepository();
const couponService = new CoupenService(couponRepository);
const couponController = new CouponController(couponService );
adminRoute.post('/login',(req:Request,res:Response)=>{
    adminController.login(req,res)
})
adminRoute.get( '/pending',authenticateToken('admin') ,(req,res) =>adminController.getPendingRestaurent (req,res));
adminRoute.post( '/update-status',(req,res)=> adminController.updateRestaurentStatus (req,res));
adminRoute.post('/refresh-token',(req,res)=>adminController.refreshAccessToken (req,res))
adminRoute.post('/logout',(req,res)=>adminController.logout(req,res))
adminRoute.get('/restaurent', (req, res) => adminController.getAllRestaurents(req, res));
adminRoute.get('/users',authenticateToken('admin'), (req, res) => adminController.getAllUsers(req, res));
adminRoute.post('/block',(req,res)=>adminController.blockRestaurent(req,res))
adminRoute.post('/block-user', (req, res) => adminController.blockUser(req, res));


// New coupon routes
adminRoute.post('/coupons', authenticateToken('admin'), (req, res) => couponController.createCoupon(req, res));
adminRoute.get('/coupons', authenticateToken('admin'), (req, res) => couponController.getAllCoupons(req, res));
adminRoute.get('/coupons/:id', authenticateToken('admin'), (req, res) => couponController.getCouponById(req, res));
adminRoute.put('/coupons/:id', authenticateToken('admin'), (req, res) => couponController.updateCoupon(req, res));
adminRoute.delete('/coupons/:id', authenticateToken('admin'), (req, res) => couponController.deleteCoupon(req, res));
export default adminRoute