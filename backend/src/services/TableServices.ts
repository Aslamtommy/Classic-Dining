// src/services/TableServices.ts
import { TableTypeRepository } from '../repositories/TableRepository';
import { BranchRepository } from '../repositories/BranchRepository';
import { ITableType } from '../models/Restaurent/TableModel';
import { ITableTypeService } from '../interfaces/table/ITableTypeService';
import { Types } from 'mongoose';

export class TableTypeService implements ITableTypeService {
  constructor(
    private _tableTypeRepository: TableTypeRepository,
    private _branchRepository: BranchRepository
  ) {}

  async createTableType(branchId: string, tableTypeData: Partial<ITableType>): Promise<ITableType> {
    const branch = await this._branchRepository.findById(branchId);
    if (!branch) throw new Error('Branch not found');

    const tableType = await this._tableTypeRepository.create({
      ...tableTypeData,
      branch: new Types.ObjectId(branchId), // Convert string to ObjectId
    });

    await this._branchRepository.addTableType(branchId, tableType._id);
    return tableType;
  }

  async getTableTypesByBranch(branchId: string): Promise<ITableType[]> {
    return await this._tableTypeRepository.findByBranch(branchId);
  }

  async updateTableTypeQuantity(tableTypeId: string, quantity: number): Promise<ITableType> {
    const updatedTableType = await this._tableTypeRepository.updateQuantity(tableTypeId, quantity);
    if (!updatedTableType) throw new Error('Table type not found or update failed');
    return updatedTableType;
  }

  async updateTableType(tableTypeId: string, updateData: Partial<ITableType>): Promise<ITableType> {
    const updatedTableType = await this._tableTypeRepository.update(tableTypeId, updateData);
    if (!updatedTableType) throw new Error('Table type not found or update failed');
    return updatedTableType;
  }

  async deleteTableType(tableTypeId: string): Promise<void> {
    await this._tableTypeRepository.delete(tableTypeId);
  }
}