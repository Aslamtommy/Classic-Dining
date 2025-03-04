import { TableTypeRepository } from '../repositories/TableRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { ITableType } from '../models/Restaurent/TableModel';
import { ITableTypeService } from '../interfaces/table/ITableTypeService';
import { Types } from 'mongoose';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class TableTypeService implements ITableTypeService {
  constructor(
    private _tableTypeRepository: TableTypeRepository,
    private _branchRepository: BranchRepository
  ) {}

  async createTableType(branchId: string, tableTypeData: Partial<ITableType>): Promise<ITableType> {
    try {
      const branch = await this._branchRepository.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);

      const tableType = await this._tableTypeRepository.create({
        ...tableTypeData,
        branch: new Types.ObjectId(branchId),
      });

      await this._branchRepository.addTableType(branchId, tableType._id);
      return tableType;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getTableTypesByBranch(branchId: string): Promise<ITableType[]> {
    try {
      const branch = await this._branchRepository.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);
      return await this._tableTypeRepository.findByBranch(branchId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTableTypeQuantity(tableTypeId: string, quantity: number): Promise<ITableType> {
    try {
      const updatedTableType = await this._tableTypeRepository.updateQuantity(tableTypeId, quantity);
      if (!updatedTableType) throw new AppError(HttpStatus.NotFound, MessageConstants.TABLE_TYPE_NOT_FOUND);
      return updatedTableType;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateTableType(tableTypeId: string, updateData: Partial<ITableType>): Promise<ITableType> {
    try {
      const updatedTableType = await this._tableTypeRepository.update(tableTypeId, updateData);
      if (!updatedTableType) throw new AppError(HttpStatus.NotFound, MessageConstants.TABLE_TYPE_NOT_FOUND);
      return updatedTableType;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteTableType(tableTypeId: string): Promise<void> {
    try {
      const tableType = await this._tableTypeRepository.findById(tableTypeId);
      if (!tableType) throw new AppError(HttpStatus.NotFound, MessageConstants.TABLE_TYPE_NOT_FOUND);
      await this._tableTypeRepository.delete(tableTypeId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
}