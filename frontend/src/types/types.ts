// src/types/types.ts
export interface Branch {
    _id: string;
    name: string;
    image: string;
    tableTypes: TableType[];
    createdAt?: string; // Optional fields from response
    updatedAt?: string;
    __v?: number;
  }
  
  export interface TableType {
    _id: string;
    branch: string; // Added from response
    name: string;
    capacity: number;
    quantity: number;
    price: number; // Added from response
    description: string; // Added from response
    createdAt?: string; // Optional fields from response
    updatedAt?: string;
    __v?: number;
  }