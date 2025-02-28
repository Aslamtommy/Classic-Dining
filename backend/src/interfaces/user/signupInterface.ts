export interface Signup {
  name: string;
  email: string;
  password?: string;  
  mobile?: string;
  is_verified: boolean;
   isBlocked: boolean;
  google_id?: string;
}
