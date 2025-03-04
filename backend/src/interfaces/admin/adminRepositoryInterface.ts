import { IAdmin } from "../../models/Admin/adminModel";
export interface IAdminRepository {  
  findByEmail(email: string): Promise<IAdmin | null>;
}