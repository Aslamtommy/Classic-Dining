 
export interface BaseTableType {
    name: string;
    capacity: number;
    quantity: number;
    description?: string;
    position?: string;
    minPartySize?: number;
    maxPartySize?: number;
  }
  
 
  export interface TableType extends BaseTableType {
    _id: string;
    branch?: string;
    createdAt?: string;
    updatedAt?: string;
    price: number;
    __v?: number;
  }
   
  export interface CreateTableTypeData extends BaseTableType {
    price: number;
  }
  
 
  export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
  }
  
 
  export interface CreateTableTypeResponse {
    branch: string;
    capacity: number;
    createdAt: string;
    description: string;
    name: string;
    price: number;
    quantity: number;
    updatedAt: string;
    __v: number;
    _id: string;
  }