import express, { Router } from 'express';
import upload from '../middlewares/multer'
import { authenticateToken } from '../middlewares/authentication';
import { RestaurentController } from '../controllers/RestaurentController';
 import {   RestaurentServices } from '../services/RestaurentServices';
 
import { RestaurentRepository } from '../repositories/RestaurentRepository';
import { OtpRepository } from '../repositories/otpRepository';
const otpRepository=new OtpRepository()
const restaurentRepository=new  RestaurentRepository()

const restaurentService=new  RestaurentServices (restaurentRepository,otpRepository) 
 const restaurentController=new RestaurentController(restaurentService)
 
 const restaurentRoute:Router=express.Router()

 restaurentRoute.post('/signup',upload.single('certificate'),(req,res)=>restaurentController.registerRestaurent(req,res))

 restaurentRoute.post('/login',(req,res)=>restaurentController .loginRestaurent(req,res));
 restaurentRoute.get('/profile/:id' ,authenticateToken('Restaurent'),(req, res) =>restaurentController .getProfile(req, res))

restaurentRoute.post('/refresh-token',(req,res)=>restaurentController .refreshAccessToken(req,res))
restaurentRoute.post('/forgot-password',(req,res)=>{
   restaurentController .forgotPassword(req,res)
})


  
restaurentRoute.post('/logout',(req,res)=>restaurentController.logout(req,res))
 restaurentRoute.post('/reset-password',(req,res)=>{
   restaurentController .resetPassword(req,res)
})

 export default restaurentRoute

 
