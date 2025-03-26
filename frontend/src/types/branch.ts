// src/types/branch.ts
export interface Branch {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  mainImage?: string; // Replaced 'image' with 'mainImage'
  interiorImages?: string[]; // Added for multiple interior images
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
  mainImage: File | null; // Updated from 'image' to 'mainImage'
  interiorImages: File[]; // Added for multiple interior images
  currentMainImage?: string; // Renamed 'currentImage' to be specific
  currentInteriorImages?: string[]; // Added to track existing interior images
}