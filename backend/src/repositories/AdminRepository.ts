 import { IAdminRepository } from "../interfaces/admin/adminRepositoryInterface";
import adminModel, { IAdmin } from "../models/Admin/adminModel";
import { AppError } from '../utils/AppError';
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";
import { BaseRepository } from "./BaseRepository/BaseRepository";

export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
    constructor() {
        super(adminModel);
    }
 
 
}

export default AdminRepository;