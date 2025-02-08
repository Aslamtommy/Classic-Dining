import express, { Router } from 'express';
import upload from '../middlewares/multer'
import { authenticateToken } from '../middlewares/authentication';
import { ManagerController } from '../controllers/managerController';
 import { ManagerService } from '../services/managerService';
import AdminController from '../controllers/AdminController';
import { ManagerRepository } from '../repositories/ManagerRepository';
import { OtpRepository } from '../repositories/otpRepository';
const otpRepository=new OtpRepository()
const managerRepository=new ManagerRepository()

const managerService=new ManagerService(managerRepository,otpRepository) 
 const Managercontroller=new ManagerController(managerService)
 
 const managerRoute:Router=express.Router()

 managerRoute.post('/signup',upload.single('certificate'),(req,res)=>Managercontroller.registerManager(req,res))

 managerRoute.post('/login',(req,res)=>Managercontroller.loginManager(req,res));
 managerRoute.get('/profile/:id' ,authenticateToken('manager'),(req, res) =>Managercontroller.getProfile(req, res))

managerRoute.post('/refresh-token',(req,res)=>Managercontroller.refreshAccessToken(req,res))
managerRoute.post('/forgot-password',(req,res)=>{
   Managercontroller.forgotPassword(req,res)
})



 

 managerRoute.post('/reset-password',(req,res)=>{
   Managercontroller.resetPassword(req,res)
})

 export default managerRoute

 
