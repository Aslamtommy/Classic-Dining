export interface Branch {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  address?: string; // Add address since it's used in the UI
  createdAt?: string; // Add fields present in the response
  updatedAt?: string;
  parentRestaurant?: string;
  tableTypes?: string[];
  isBranch?: boolean;
}

export interface BranchResponse {
  status: number;
  message: string;
  data: Branch; // Use the updated Branch interface
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
    image: File | null;
    currentImage: string;
  }