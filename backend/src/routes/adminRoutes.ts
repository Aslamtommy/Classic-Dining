// src/routes/adminRoute.ts
import express, { Router, Request, Response } from "express";
import { authenticateToken } from "../middlewares/authentication";
import AdminController from "../controllers/AdminController";
import { AdminDashboardController } from "../controllers/AdminDashboardController"; // New import
import AdminService from "../services/AdminService";
import { AdminDashboardService } from "../services/AdminDashboardService"; // New import
import { AdminRepository } from "../repositories/AdminRepository";
import { RestaurentRepository } from "../repositories/RestaurentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CouponService } from "../services/CouponService";
import { CouponController } from "../controllers/CouponController";
import { CouponRepository } from "../repositories/CouponRepository";
import { AdminDashboardRepository } from "../repositories/AdminDashboardRepository"; // New import

const adminRoute: Router = express.Router();

// Dependency Injection
const restaurentRepository = new RestaurentRepository();
const userRepository = new UserRepository();
const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository, restaurentRepository, userRepository);
const adminController = new AdminController(adminService);

const adminDashboardRepository = new AdminDashboardRepository();
const adminDashboardService = new AdminDashboardService(adminDashboardRepository);
const adminDashboardController = new AdminDashboardController(adminDashboardService);

const couponRepository = new CouponRepository();
const couponService = new CouponService(couponRepository);
const couponController = new CouponController(couponService);

// Admin Routes
adminRoute.post("/login", (req: Request, res: Response) => adminController.login(req, res));
adminRoute.get("/pending", authenticateToken("admin"), (req, res) => adminController.getPendingRestaurent(req, res));
adminRoute.post("/update-status", authenticateToken("admin"), (req, res) => adminController.updateRestaurentStatus(req, res));
adminRoute.post("/refresh-token", (req, res) => adminController.refreshAccessToken(req, res));
adminRoute.post("/logout", (req, res) => adminController.logout(req, res));
adminRoute.get("/restaurent", authenticateToken("admin"), (req, res) => adminController.getAllRestaurents(req, res));
adminRoute.get("/users", authenticateToken("admin"), (req, res) => adminController.getAllUsers(req, res));
adminRoute.post("/block", authenticateToken("admin"), (req, res) => adminController.blockRestaurent(req, res));
adminRoute.post("/block-user", authenticateToken("admin"), (req, res) => adminController.blockUser(req, res));

// Dashboard Route
adminRoute.get("/dashboard", authenticateToken("admin"), (req, res) => adminDashboardController.getDashboardData(req, res));

// Coupon Routes
adminRoute.post("/coupons", authenticateToken("admin"), (req, res) => couponController.createCoupon(req, res));
adminRoute.get("/coupons", authenticateToken("admin"), (req, res) => couponController.getAllCoupons(req, res));
adminRoute.get("/coupons/:id", authenticateToken("admin"), (req, res) => couponController.getCouponById(req, res));
adminRoute.put("/coupons/:id", authenticateToken("admin"), (req, res) => couponController.updateCoupon(req, res));
adminRoute.delete("/coupons/:id", authenticateToken("admin"), (req, res) => couponController.deleteCoupon(req, res));

export default adminRoute;