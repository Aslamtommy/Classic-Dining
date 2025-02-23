 
import { ITableType } from '../models/Restaurent/TableModel';
import TableModel from '../models/Restaurent/TableModel';


export class TableTypeRepository {
  async create(tableTypeData: Partial<ITableType>): Promise<ITableType> {
    return await  TableModel.create(tableTypeData);
  }

  async findByBranch(branchId: string): Promise<ITableType[]> {
    return await  TableModel.find({ branch: branchId });
  }

  async findById(tableTypeId: string): Promise<ITableType | null> {
    return await  TableModel.findById(tableTypeId);
  }

  async updateQuantity(tableTypeId: string, quantity: number): Promise<ITableType | null> {
    return await  TableModel.findByIdAndUpdate(
      tableTypeId,
      { quantity },
      { new: true }
    );
  }

  async update(tableTypeId:any,updateData :any ):Promise<ITableType| null> {
    return await TableModel.findByIdAndUpdate(
      tableTypeId,{$set:updateData},{new:true}
    )
  }

  async delete(tableTypeId: string): Promise<void> {
    await  TableModel.findByIdAndDelete(tableTypeId);
  }

  async findAllByBranch(branchId: string): Promise<ITableType[]> {
    return TableModel.find({ branch: branchId }).exec();
  }
}