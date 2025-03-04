// src/routes/restaurentRoute.ts
import express, { Router } from 'express';
import upload from '../middlewares/multer';
import { authenticateToken } from '../middlewares/authentication';
import { RestaurentController } from '../controllers/RestaurentController';
import { RestaurentServices } from '../services/RestaurentServices';
import { BranchRepository } from '../repositories/BranchRepository';
import { RestaurentRepository } from '../repositories/RestaurentRepository';
import { OtpRepository } from '../repositories/otpRepository';
import { BranchService } from '../services/BranchService';
import { BranchController } from '../controllers/BranchController';
import { TableTypeController } from '../controllers/TableController';
import { checkApproved } from '../middlewares/checkApproved';
import { ReservationController } from '../controllers/ReservationController';
import { ReservationService } from '../services/ReservationService';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { CouponRepository } from '../repositories/CouponRepository';
import { TableTypeService } from '../services/TableServices';

const restaurentRoute: Router = express.Router();

// Instantiate repositories
const otpRepository = new OtpRepository();
const branchRepository = new BranchRepository();
const restaurentRepository = new RestaurentRepository();
const reservationRepository = new ReservationRepository();
const tableTypeRepository = new TableTypeRepository();
const walletRepository = new WalletRepository();
const couponRepository = new CouponRepository();

// Instantiate services
const branchService = new BranchService(branchRepository, restaurentRepository);
const reservationService = new ReservationService(
  reservationRepository,
  branchRepository,
  tableTypeRepository,
  walletRepository,
  couponRepository
);

 
const tableTypeService = new TableTypeService(tableTypeRepository, branchRepository);

// Instantiate controllers
const branchController = new BranchController(branchService);
const reservationController = new ReservationController(reservationService);
const restaurentService = new RestaurentServices(restaurentRepository, otpRepository,  branchRepository);
const restaurentController = new RestaurentController(restaurentService);
const tabletypeController = new TableTypeController(tableTypeService);

// Routes
restaurentRoute.post('/signup', upload.single('certificate'), (req, res) => restaurentController.registerRestaurent(req, res));
restaurentRoute.post('/login', (req, res) => restaurentController.loginRestaurent(req, res));
restaurentRoute.get('/profile/:id', authenticateToken('restaurent'), (req, res) => restaurentController.getProfile(req, res));
restaurentRoute.post('/refresh-token', (req, res) => restaurentController.refreshAccessToken(req, res));
restaurentRoute.post('/forgot-password', (req, res) => restaurentController.forgotPassword(req, res));
restaurentRoute.post('/logout', (req, res) => restaurentController.logout(req, res));
restaurentRoute.post('/reset-password', (req, res) => restaurentController.resetPassword(req, res));

restaurentRoute.post('/branches', authenticateToken('restaurent'), checkApproved, upload.single('image'), (req, res) => branchController.createBranch(req, res));
restaurentRoute.get('/allbranches', authenticateToken('restaurent'), checkApproved, (req, res) => branchController.getBranches(req, res));
restaurentRoute.get('/branches/:branchId', authenticateToken('restaurent'), (req, res) => branchController.getBranchDetails(req, res));
restaurentRoute.put('/branches/:branchId', authenticateToken('restaurent'), upload.single('image'), (req, res) => branchController.updateBranch(req, res));
restaurentRoute.delete('/branches/:branchId', authenticateToken('restaurent'), (req, res) => branchController.deleteBranch(req, res));

restaurentRoute.post('/branches/:branchId/tables', (req, res) => tabletypeController.createTableType(req, res));
restaurentRoute.get('/branches/:branchId/tables', (req, res) => tabletypeController.getTableTypesByBranch(req, res));
restaurentRoute.put('/tables/:tableTypeId/quantity', (req, res) => tabletypeController.updateTableTypeQuantity(req, res));
restaurentRoute.delete('/tables/:tableTypeId', (req, res) => tabletypeController.deleteTableType(req, res));

restaurentRoute.get('/branches/:branchId/reservations', authenticateToken('branch'), (req, res) => reservationController.getBranchReservations(req, res));
restaurentRoute.put('/reservations/:reservationId/status', authenticateToken('branch'), (req, res) => reservationController.updateBranchReservationStatus(req, res));

export default restaurentRoute;