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
  import { CoupenService  } from '../services/CouponService';
  import { CouponRepository } from '../repositories/CouponRepository';
const userRoute: Router = express.Router();
const branchRepository=new BranchRepository()
const userRepository=new UserRepository()
const otpRepository=new OtpRepository()
const reservationController = new ReservationController()
const couponRepository=new CouponRepository()
const userService=new UserService(userRepository,otpRepository,branchRepository)
const coupenService=new CoupenService(couponRepository)
const userController = new Usercontroller(userService,branchRepository,coupenService );
const walletController=new WalletController()
 
// Register user
userRoute.post('/register', (req: Request, res: Response) => {
  userController.registerUser(req, res);
});

 
// User login
userRoute.post('/login',    (req: Request, res: Response) => {
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
userRoute.get('/profile', authenticateToken('user'),blockedUserMiddleware, (req: Request, res: Response) => {
  userController.getProfile(req, res);
});


userRoute.post('/forgot-password', (req: Request, res: Response) => {
  userController.forgotPassword(req, res);
});

userRoute.post('/reset-password',(req: Request, res: Response)=>{
  userController.resetPassword(req,res)
})


userRoute.post('/uploadProfilePicture',authenticateToken('user'),upload.single('profilePicture'),(req: Request, res: Response)=>{
  userController.uploadProfilePicture(req,res)
})
userRoute.post('/logout',(req,res)=>userController.logout(req,res))
userRoute.put('/updateProfile',authenticateToken('user'),(req,res)=>userController.updateProfile(req,res))

userRoute.get('/branches',(req,res)=>userController.getAllBranches(req,res))
 
 userRoute.get('/branches/:branchId',(req,res)=>userController.getBranchDetails(req,res))
 


 

 



userRoute.post('/reservations', authenticateToken('user'), (req, res) => reservationController.createReservation(req, res));
userRoute.get('/reservations/:id', authenticateToken('user'), (req, res) => reservationController.getReservation(req, res));
userRoute.put('/reservations/:id/cancel', authenticateToken('user'), (req, res) => reservationController.cancelReservation(req, res));
userRoute.put('/reservations/:id/confirm', authenticateToken('user'), (req, res) => reservationController.confirmReservation(req, res));
userRoute.put('/reservations/:id/fail', authenticateToken('user'), (req, res) => reservationController.failReservation(req, res));
userRoute.get('/available-tables', authenticateToken('user'), (req, res) => reservationController.getAvailableTables(req, res));
userRoute.post('/payments/create-order', authenticateToken('user'), (req, res) => reservationController.createPaymentOrder(req, res));
userRoute.post('/reservations/:id/confirm-wallet',authenticateToken('user'),(req,res)=>{
  reservationController.confirmWithWallet(req,res)
})


userRoute.get('/reservations',authenticateToken('user'),(req,res)=>reservationController.getUserReservations(req,res))

userRoute.get('/wallet',authenticateToken('user'),(req,res)=>walletController.getWalletData(req,res))
 userRoute.post('/wallet/create-order',authenticateToken('user'),(req,res)=>walletController.createAddMoneyOrder(req,res))
userRoute.post('/wallet/confirm-add',authenticateToken('user'),(req,res)=>walletController.confirmAddMoney(req,res))

userRoute.get('/coupons', authenticateToken('user'), (req, res) => userController.getAvailableCoupons(req, res))
export default userRoute;

