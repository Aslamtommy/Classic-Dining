// src/routes/userRoute.ts
import express, { Router, Request, Response } from 'express';
import { Usercontroller } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authentication';
import upload from '../middlewares/multer';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { OtpRepository } from '../repositories/otpRepository';
import blockedUserMiddleware from '../middlewares/blockedUserMiddleware';
import { BranchRepository } from '../repositories/BranchRepository';
import { ReservationController } from '../controllers/ReservationController';
import { WalletController } from '../controllers/WalletController';
import { CouponService } from '../services/CouponService';
import { CouponRepository } from '../repositories/CouponRepository';
import { ReservationService } from '../services/ReservationService'; // Added import
import { ReservationRepository } from '../repositories/ReservationRepository'; // Added import
import { TableTypeRepository } from '../repositories/TableRepository'; // Added import
import { WalletRepository } from '../repositories/WalletRepository'; // Added import
import { WalletService } from '../services/WalletService';
import { NotificationService } from '../services/NotificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
const userRoute: Router = express.Router();

// Instantiate repositories
const branchRepository = new BranchRepository();
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const couponRepository = new CouponRepository();
const reservationRepository = new ReservationRepository();
const tableTypeRepository = new TableTypeRepository();
const walletRepository = new WalletRepository();
const notificationRepository = new NotificationRepository();
// Instantiate services
const userService = new UserService(userRepository, otpRepository, branchRepository);
const couponService = new CouponService(couponRepository); // Corrected typo
const reservationService = new ReservationService(
  reservationRepository,
  branchRepository,
  tableTypeRepository,
  walletRepository,
  couponRepository
);
const walletService = new WalletService( walletRepository );
const notificationService = new NotificationService(notificationRepository);
// Instantiate controllers
const userController = new Usercontroller(userService, couponService,notificationService);
const reservationController = new ReservationController(reservationService); // Pass reservationService
const walletController = new WalletController(walletService);

// Register user
userRoute.post('/register', (req: Request, res: Response) => {
  userController.registerUser(req, res);
});

// User login
userRoute.post('/login',  blockedUserMiddleware,(req: Request, res: Response) => {
  userController.signIn(req, res);
});

// Google Sign-in
userRoute.post('/google', (req: Request, res: Response) => {
  userController.googleSignIn(req, res);
});

// Refresh access token
userRoute.post('/refresh-token', (req: Request, res: Response) => {
  userController.refreshAccessToken(req, res);
});

// User profile (using middleware for authentication)
userRoute.get('/profile', authenticateToken('user'), blockedUserMiddleware, (req: Request, res: Response) => {
  userController.getProfile(req, res);
});

userRoute.post('/forgot-password', (req: Request, res: Response) => {
  userController.forgotPassword(req, res);
});

userRoute.post('/reset-password', (req: Request, res: Response) => {
  userController.resetPassword(req, res);
});

userRoute.post('/uploadProfilePicture', authenticateToken('user'), upload.single('profilePicture'), (req: Request, res: Response) => {
  userController.uploadProfilePicture(req, res);
});

userRoute.post('/logout', (req, res) => userController.logout(req, res));
userRoute.put('/updateProfile', authenticateToken('user'), (req, res) => userController.updateProfile(req, res));

userRoute.get('/branches', blockedUserMiddleware, (req, res) => userController.getAllBranches(req, res));
userRoute.get('/branches/:branchId', blockedUserMiddleware, (req, res) => userController.getBranchDetails(req, res));

// Reservation routes
userRoute.post('/reservations', authenticateToken('user'), (req, res) => reservationController.createReservation(req, res));
userRoute.get('/reservations/:id', authenticateToken('user'), (req, res) => reservationController.getReservation(req, res));
userRoute.put('/reservations/:id/cancel', authenticateToken('user'), (req, res) => reservationController.cancelReservation(req, res));
userRoute.put('/reservations/:id/confirm', authenticateToken('user'), (req, res) => reservationController.confirmReservation(req, res));
userRoute.put('/reservations/:id/fail', authenticateToken('user'), (req, res) => reservationController.failReservation(req, res));
userRoute.get('/available-tables', authenticateToken('user'), (req, res) => reservationController.getAvailableTables(req, res));
userRoute.post('/payments/create-order', authenticateToken('user'), (req, res) => reservationController.createPaymentOrder(req, res));
userRoute.post('/reservations/:id/confirm-wallet', authenticateToken('user'), (req, res) => {
  reservationController.confirmWithWallet(req, res);
});
 
userRoute.post('/reservations/:reservationId/review', authenticateToken('user'), (req, res) => {
  reservationController.submitReview(req, res);
});
userRoute.get('/reservations', authenticateToken('user'), (req, res) => reservationController.getUserReservations(req, res));
 
userRoute.get('/branches/:branchId/reviews', authenticateToken('user'), (req, res) => {
  reservationController.getBranchReviews(req, res);
});
// Wallet routes
userRoute.get('/wallet', authenticateToken('user'), (req, res) => walletController.getWalletData(req, res));
userRoute.post('/wallet/create-order', authenticateToken('user'), (req, res) => walletController.createAddMoneyOrder(req, res));
userRoute.post('/wallet/confirm-add', authenticateToken('user'), (req, res) => walletController.confirmAddMoney(req, res));

// Coupon route
userRoute.get('/coupons', authenticateToken('user'), (req, res) => userController.getAvailableCoupons(req, res));


// Notification routes
userRoute.get('/notifications', authenticateToken('user'), (req: Request, res: Response) => userController.getNotifications(req, res));
userRoute.patch('/notifications/:notificationId/read', authenticateToken('user'), (req: Request, res: Response) => userController.markNotificationAsRead(req, res));

export default userRoute;