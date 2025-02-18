import restaurentApi from "../Axios/restaurentInstance";

// Define TypeScript interfaces
interface TableType {
  _id: string;
  name: string;
  capacity: number;
  quantity: number;
  description?: string;
  position?: string;
  minPartySize?: number;
  maxPartySize?: number;
}

interface CreateTableTypeData {
  name: string;
  capacity: number;
  quantity: number;
  description?: string;
  position?: string;
  minPartySize?: number;
  maxPartySize?: number;
}

export const tableTypeApi = {
  // Create a new table type
  createTableType: async (branchId: string, data: CreateTableTypeData): Promise<TableType> => {
    try {
      const response:any = await restaurentApi.post(`/branches/${branchId}/tables`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating table type:', error);
      throw new Error('Failed to create table type');
    }
  },

  // Get all table types for a branch
  getTableTypes: async (branchId: string): Promise<TableType[]> => {
    try {
      const response:any = await restaurentApi.get(`/branches/${branchId}/tables`);
      return response.data;
    } catch (error) {
      console.error('Error fetching table types:', error);
      throw new Error('Failed to fetch table types');
    }
  },

  // Update table type quantity
  updateTableTypeQuantity: async (tableTypeId: string, quantity: number): Promise<TableType> => {
    try {
      const response:any = await restaurentApi.put(
        `/tables/${tableTypeId}/quantity`,
        { quantity },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating table quantity:', error);
      throw new Error('Failed to update table quantity');
    }
  },

  // Delete a table type
  deleteTableType: async (tableTypeId: string): Promise<void> => {
    try {
      await restaurentApi.delete(`/tables/${tableTypeId}`);
    } catch (error) {
      console.error('Error deleting table type:', error);
      throw new Error('Failed to delete table type');
    }
  },
};