 
import { ITableType } from "../../services/TableServices";

export interface ITableTypeRepository {
  create(tableTypeData: Partial<ITableType>): Promise<ITableType>;
  findByBranch(branchId: string): Promise<ITableType[]>;
  findById(tableTypeId: string): Promise<ITableType | null>;
  updateQuantity(tableTypeId: string, quantity: number): Promise<ITableType | null>;
  update(tableTypeId: string, updateData: Partial<ITableType>): Promise<ITableType | null>;
  delete(tableTypeId: string): Promise<void>;
  findAllByBranch(branchId: string): Promise<ITableType[]>;
}