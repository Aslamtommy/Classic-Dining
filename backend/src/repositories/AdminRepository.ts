 import { IAdminRepository } from "../interfaces/admin/adminRepositoryInterface";
import adminModel, { IAdmin } from "../models/Admin/adminModel";
import { AppError } from '../utils/AppError';
import { HttpStatus } from "../constants/HttpStatus";
import { MessageConstants } from "../constants/MessageConstants";

export class AdminRepository implements IAdminRepository {
    async findByEmail(email: string): Promise<IAdmin | null> {
        try {
            return await adminModel.findOne({ email }).exec();
        } catch (error) {
            console.error('Error in findByEmail:', error);
            const errorMessage = error instanceof Error 
                ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
                : MessageConstants.INTERNAL_SERVER_ERROR;
            throw new AppError(HttpStatus.InternalServerError, errorMessage);
        }
    }
 
}

export default AdminRepository;