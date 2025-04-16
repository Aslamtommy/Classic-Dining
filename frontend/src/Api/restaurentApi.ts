// tableTypeApi.ts
import restaurentApi from "../Axios/restaurentInstance";
import {CreateTableTypeData,TableType,ApiResponse,CreateTableTypeResponse}  from "../types/table";
// Define notification types
interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
  };
}

export const tableTypeApi = {
  // Create a new table type
  createTableType: async (
    branchId: string,
    data: CreateTableTypeData
  ): Promise<TableType> => {
    try {
      const response = await restaurentApi.post<ApiResponse<CreateTableTypeResponse>>(
        `/branches/${branchId}/tables`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('createTableTyperesponse', response);
      return response.data.data;
    } catch (error) {
      console.error('Error creating table type:', error);
      throw new Error('Failed to create table type');
    }
  },

  // Get all table types for a branch
  getTableTypes: async (branchId: string): Promise<TableType[]> => {
    try {
      const response = await restaurentApi.get<ApiResponse<TableType[]>>(
        `/branches/${branchId}/tables`
      );
      console.log('getTableTypesresponse', response);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching table types:', error);
      throw new Error('Failed to fetch table types');
    }
  },

  // Update table type quantity
  updateTableTypeQuantity: async (
    tableTypeId: string,
    quantity: number
  ): Promise<TableType> => {
    try {
      const response = await restaurentApi.put<ApiResponse<TableType>>(
        `/tables/${tableTypeId}/quantity`,
        { quantity },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('updateTableTypeQuantityresponse', response);
      return response.data.data;
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

  // Update table type
  updateTableType: async (
    tableTypeId: string,
    data: Partial<CreateTableTypeData>
  ): Promise<TableType> => {
    try {
      const response = await restaurentApi.put<ApiResponse<TableType>>(
        `/edittables/${tableTypeId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating table type:', error);
      throw new Error('Failed to update table type');
    }
  },
    // Fetch notifications for restaurant/branch
    getNotifications: async (
      page: number = 1,
      limit: number = 10
    ): Promise<NotificationsResponse['data']> => {
      try {
        const response = await restaurentApi.get<NotificationsResponse>('/notifications', {
          params: { page, limit },
        });
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch notifications');
        }
        console.log('getNotifications response', response);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Failed to fetch notifications');
      }
    },
  
   
};