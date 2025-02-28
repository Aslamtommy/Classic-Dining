 
import { IUser } from '../../models/User/userModel';

export interface UserRepositoryInterface {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  findAll(filter: any, skip: number, limit: number): Promise<IUser[]>;
  countAll(filter:any): Promise<number>;
  findById(userId: string): Promise<IUser | null>;
 
 
    updateProfilePicture(userId: string, profilePicture: string): Promise<any>;
 
  save(user:IUser):Promise<IUser>
  update(id: string, updateData: any): Promise<any>
}
