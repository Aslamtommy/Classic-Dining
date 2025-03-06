 
export interface Admin {
    _id: string;
    email: string;
    password: string;
    createdAt: string;
  }
  
  export interface AdminLoginResponse {
    success: boolean;
    message: string;
    data: {
      admin: Admin;
      email: string;
    };
  }

 
 