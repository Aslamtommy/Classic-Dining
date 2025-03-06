import { ITableType } from '../models/Restaurent/TableModel';
import TableModel from '../models/Restaurent/TableModel';
import { ITableTypeRepository } from '../interfaces/table/ITableTypeRepository';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { BaseRepository } from './BaseRepository/BaseRepository';
export class TableTypeRepository extends BaseRepository<ITableType> implements ITableTypeRepository {
  constructor() {
    super(TableModel);
  }
   

  async findByBranch(branchId: string): Promise<ITableType[]> {
    try {
      return await TableModel.find({ branch: branchId }).exec();
    } catch (error) {
      console.error('Error in findByBranch:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

   

  async updateQuantity(tableTypeId: string, quantity: number): Promise<ITableType | null> {
    try {
      return await TableModel.findByIdAndUpdate(tableTypeId, { quantity }, { new: true }).exec();
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  
   

  async findAllByBranch(branchId: string): Promise<ITableType[]> {
    try {
      return await TableModel.find({ branch: branchId }).exec();
    } catch (error) {
      console.error('Error in findAllByBranch:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}