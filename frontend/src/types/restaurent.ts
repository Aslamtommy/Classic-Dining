 
export interface Restaurent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  certificate?: string;
  password?: string;  
  blockReason?: string | null; 
  branches?: string[];  
  createdAt?: string;  
  updatedAt?: string;  
  isBlocked?: boolean;  
  isBranch?: boolean; 
  role?: "restaurent" | "branch";  
  parentRestaurantId?: string;  
  
}
  export interface RestaurentState {
    restaurent: Restaurent | null;
    profile: Restaurent | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface SignupFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    certificate: File;
  }
  
  export interface RestaurentResponse {
    data: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      certificate?: string;
      password?: string;  
      blockReason?: string | null; 
      branches?: string[];  
      createdAt?: string;  
      updatedAt?: string;  
      isBlocked?: boolean;  
      isBranch?: boolean; 
      role?: "restaurent" | "branch";  
      parentRestaurantId?: string;  
    };
    
  }

  export interface LoginResponse {
    status: number;
    message: string;
    data: Restaurent;
  }
  
  
  export interface ErrorResponse {
    message: string;
    status?: number;
    data?: {
      reason?: string;
    };
  }
  
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  export     interface PendingRestaurentsResponse {
    success: boolean;
    message: string;
    data: {
      restaurents: Restaurent[];
      total: number;
      page: number;
      limit: number;
    };
  }

  export interface FetchRestaurentsResponse {
    restaurents: Restaurent[];
    total: number;
  }