 import { ITableType } from "../../models/Restaurent/TableModel";

export interface ITableTypeService {
  createTableType(branchId: string, tableTypeData: Partial<ITableType>): Promise<ITableType>;
  getTableTypesByBranch(branchId: string): Promise<ITableType[]>;
  updateTableTypeQuantity(tableTypeId: string, quantity: number): Promise<ITableType>;
  updateTableType(tableTypeId: string, updateData: Partial<ITableType>): Promise<ITableType>;
  deleteTableType(tableTypeId: string): Promise<void>;
}