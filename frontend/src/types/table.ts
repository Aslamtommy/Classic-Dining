// Base interface for common table type properties
export interface BaseTableType {
    name: string;
    capacity: number;
    quantity: number;
    description?: string;
    position?: string;
    minPartySize?: number;
    maxPartySize?: number;
  }
  
  // Interface for table type as stored in database (with additional fields)
  export interface TableType extends BaseTableType {
    _id: string;
    branch?: string;
    createdAt?: string;
    updatedAt?: string;
    price: number;
    __v?: number;
  }
  
  // Interface for creating a new table type (request data)
  export interface CreateTableTypeData extends BaseTableType {
    price: number;
  }
  
  // Interface for API response structure
  export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
  }
  
  // Interface for table type creation response
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