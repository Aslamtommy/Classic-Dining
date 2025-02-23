// src/services/TableTypeService.ts
import { TableTypeRepository } from '../repositories/TableRepository';
import { BranchRepository } from '../repositories/BranchRepository';
 
export interface ITableType {
    _id: string;
    name: string;
    capacity: number;
    branch: string;
  }
  
export class TableTypeService {
  private tableTypeRepository: TableTypeRepository;
  private branchRepository: BranchRepository;

  constructor() {
    this.tableTypeRepository = new TableTypeRepository();
    this.branchRepository = new BranchRepository();
  }

  async createTableType(branchId: string, tableTypeData: any) {
    // Validate branch
    const branch = await this.branchRepository.findById(branchId);
    if (!branch) {
      throw new Error('Branch not found');
    }

    // Create table type
    const tableType = await this.tableTypeRepository.create({
      ...tableTypeData,
      branch: branchId,
    });
      // Link table type to branch
      await this.branchRepository.addTableType(branchId, tableType._id );

    return tableType;
  }

  async getTableTypesByBranch(branchId: string) {
    return await this.tableTypeRepository.findByBranch(branchId);
  }

  async updateTableTypeQuantity(tableTypeId: string, quantity: number) {
    return await this.tableTypeRepository.updateQuantity(tableTypeId, quantity);
  }
 // TableTypeService.ts
async updateTableType(tableTypeId: string, updateData: Partial<ITableType>) {
  return await this.tableTypeRepository.update(tableTypeId, updateData);
}

  async deleteTableType(tableTypeId: string) {
    await this.tableTypeRepository.delete(tableTypeId);
  }
}