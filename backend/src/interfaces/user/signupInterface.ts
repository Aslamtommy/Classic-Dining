export interface Signup {
  name: string;
  email: string;
  password?: string;  
  mobile_no?: string;
  is_verified: boolean;
  is_blocked: boolean;
  google_id?: string;
}
