import express, { Router, Request, Response } from 'express';
import { Usercontroller } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authentication';
import upload from '../middlewares/multer';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { OtpRepository } from '../repositories/otpRepository';
import blockedUserMiddleware from '../middlewares/blockedUserMiddleware';
import { BranchRepository } from '../repositories/BranchRepository';


const userRoute: Router = express.Router();
const branchRepository=new BranchRepository()
const userRepository=new UserRepository()
const otpRepository=new OtpRepository()
const userService=new UserService(userRepository,otpRepository)

const userController = new Usercontroller(userService,branchRepository );

 
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
export default userRoute;
