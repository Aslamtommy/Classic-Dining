// src/types/branch.ts
export interface Branch {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  mainImage?: string; 
  interiorImages?: string[];  
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  parentRestaurant?: string;
  tableTypes?: string[];
  isBranch?: boolean;
  location?: {
    type: string; // e.g., "Point"
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface BranchResponse {
  status: number;
  message: string;
  data: Branch;
  success: boolean;
}

export interface BranchesResponse {
  status: number;
  message: string;
  data: {
    branches: Branch[];
    total: number;
    page: number;
    pages: number;
  };
  success: boolean;
}

export interface BranchFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  mainImage: File | null;  
  interiorImages: File[];  
  currentMainImage?: string;  
  currentInteriorImages?: string[]; 
}