import { ITableType } from '../models/Restaurent/TableModel';
import TableModel from '../models/Restaurent/TableModel';
import { ITableTypeRepository } from '../interfaces/table/ITableTypeRepository';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class TableTypeRepository implements ITableTypeRepository {
  async create(tableTypeData: Partial<ITableType>): Promise<ITableType> {
    try {
      return await TableModel.create(tableTypeData);
    } catch (error) {
      console.error('Error in create:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByBranch(branchId: string): Promise<ITableType[]> {
    try {
      return await TableModel.find({ branch: branchId }).exec();
    } catch (error) {
      console.error('Error in findByBranch:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(tableTypeId: string): Promise<ITableType | null> {
    try {
      return await TableModel.findById(tableTypeId).exec();
    } catch (error) {
      console.error('Error in findById:', error);
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

  async update(tableTypeId: string, updateData: Partial<ITableType>): Promise<ITableType | null> {
    try {
      return await TableModel.findByIdAndUpdate(tableTypeId, { $set: updateData }, { new: true }).exec();
    } catch (error) {
      console.error('Error in update:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(tableTypeId: string): Promise<void> {
    try {
      const result = await TableModel.findByIdAndDelete(tableTypeId).exec();
      if (!result) throw new AppError(HttpStatus.NotFound, MessageConstants.TABLE_TYPE_NOT_FOUND);
    } catch (error) {
      console.error('Error in delete:', error);
      if (error instanceof AppError) throw error;
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