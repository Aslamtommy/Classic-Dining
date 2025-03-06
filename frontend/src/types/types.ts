 
export interface Branch {
    _id: string;
    name: string;
    image: string;
    tableTypes: TableType[];
    createdAt?: string; 
    updatedAt?: string;
    __v?: number;
  }
  
  export interface TableType {
    _id: string;
    branch: string;  
    name: string;
    capacity: number;
    quantity: number;
    price: number 
    description: string;  
    createdAt?: string;  
    updatedAt?: string;
    __v?: number;
  }