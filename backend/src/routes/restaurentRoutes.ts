import express, { Router } from 'express';
import upload from '../middlewares/multer'
import { authenticateToken } from '../middlewares/authentication';
import { RestaurentController } from '../controllers/RestaurentController';
 import {   RestaurentServices } from '../services/RestaurentServices';
 import { BranchRepository } from '../repositories/BranchRepository';
import { RestaurentRepository } from '../repositories/RestaurentRepository';
import { OtpRepository } from '../repositories/otpRepository';
import { BranchService } from '../services/BranchService';
import { BranchController } from '../controllers/BranchController'
import { TableTypeController } from '../controllers/TableController';
import { checkApproved } from '../middlewares/checkApproved';
import { ReservationController } from '../controllers/ReservationController';

const otpRepository=new OtpRepository()
const branchRepository=new BranchRepository()
const restaurentRepository=new  RestaurentRepository()
const reservationController=new ReservationController()
const branchService=new BranchService()
const branchController=new BranchController()
const restaurentService=new  RestaurentServices (restaurentRepository,otpRepository,branchService,branchRepository ) 
 const restaurentController=new RestaurentController(restaurentService)
 
const tabletypeController=new TableTypeController( )
 

 





 
 const restaurentRoute:Router=express.Router()

 restaurentRoute.post('/signup',upload.single('certificate'),(req,res)=>restaurentController.registerRestaurent(req,res))

 restaurentRoute.post('/login',(req,res)=>restaurentController .loginRestaurent(req,res));
 restaurentRoute.get('/profile/:id' ,authenticateToken('restaurent'),(req, res) =>restaurentController .getProfile(req, res))

restaurentRoute.post('/refresh-token',(req,res)=>restaurentController .refreshAccessToken(req,res))
restaurentRoute.post('/forgot-password',(req,res)=>{
   restaurentController .forgotPassword(req,res)
})


  
restaurentRoute.post('/logout',(req,res)=>restaurentController.logout(req,res))
 restaurentRoute.post('/reset-password',(req,res)=>{
   restaurentController .resetPassword(req,res)
})



restaurentRoute.post('/branches',authenticateToken('restaurent'),checkApproved,upload.single('image'),(req,res)=>{
   branchController.createBranch(req,res)
})

restaurentRoute.get('/allbranches',authenticateToken('restaurent'),checkApproved, (req,res)=>{
   branchController.getBranches(req,res)
})

restaurentRoute.get('/branches/:branchId', authenticateToken('restaurent'), (req, res) => {
   branchController.getBranchDetails(req, res)
}) 
restaurentRoute.put('/branches/:branchId', authenticateToken('restaurent'),upload.single('image'), (req, res) => {
   branchController.updateBranch(req, res)
}) 
restaurentRoute.delete('/branches/:branchId', authenticateToken('restaurent'),  (req, res) => {
   branchController.deleteBranch(req, res)
}) 


restaurentRoute.post('/branches/:branchId/tables',(req,res)=>tabletypeController.createTableType(req,res))
restaurentRoute.get('/branches/:branchId/tables',(req,res)=>tabletypeController.getTableTypesByBranch(req,res))
restaurentRoute.put('/tables/:tableTypeId/quantity',(req,res)=>tabletypeController.updateTableTypeQuantity(req,res))
 
restaurentRoute.delete('/tables/:tableTypeId',(req,res)=>tabletypeController.deleteTableType(req,res))


//Routes for branchside
restaurentRoute.get('/branches/:branchId/reservations',authenticateToken('branch'),(req,res)=>reservationController.getBranchReservations(req,res))
restaurentRoute.put('/reservations/:reservationId/status',authenticateToken('branch'),(req,res)=>reservationController.updateBranchReservationStatus(req,res))
 export default restaurentRoute

 
 
 