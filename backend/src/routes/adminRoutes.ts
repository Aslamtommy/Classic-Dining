import express, { Router, Request, Response } from 'express';

import { authenticateToken } from '../middlewares/authentication';
import AdminController from '../controllers/AdminController';
 import AdminService from '../services/AdminService';
 import { AdminRepository } from '../repositories/AdminRepository';
import { ManagerRepository } from '../repositories/ManagerRepository';
import { UserRepository } from '../repositories/UserRepository';


const adminRoute:Router=express.Router();

const managerRepository=new ManagerRepository()
const userRepository=new UserRepository()
const adminRepository=new AdminRepository()
const adminService=new AdminService(adminRepository,managerRepository,userRepository)
const adminController=new AdminController(adminService)
 
adminRoute.post('/login',(req:Request,res:Response)=>{
    adminController.login(req,res)
})
adminRoute.get( '/pending',authenticateToken('admin') ,(req,res) =>adminController.getPendingManagers (req,res));
adminRoute.post( '/update-status',(req,res)=> adminController.updateManagerStatus (req,res));
adminRoute.post('/refresh-token',(req,res)=>adminController.refreshAccessToken (req,res))
adminRoute.post('/logout',(req,res)=>adminController.logout(req,res))
adminRoute.get('/managers', (req, res) => adminController.getAllManagers(req, res));
adminRoute.get('/users', (req, res) => adminController.getAllUsers(req, res));
adminRoute.post('/block',(req,res)=>adminController.blockManager(req,res))
adminRoute.post('/block-user', (req, res) => adminController.blockUser(req, res));


export default adminRoute