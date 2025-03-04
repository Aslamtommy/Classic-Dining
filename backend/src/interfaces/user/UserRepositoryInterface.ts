 import { IUser } from '../../models/User/userModel';
import { FilterQuery } from 'mongoose'; 

export interface UserRepositoryInterface {
  create(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  findAll(filter: FilterQuery<IUser>, skip: number, limit: number): Promise<IUser[]>;
  countAll(filter: FilterQuery<IUser>): Promise<number>;
  findById(userId: string): Promise<IUser | null>;
  updateProfilePicture(userId: string, profilePicture: string): Promise<IUser | null>;
  save(user: IUser): Promise<IUser>;
  update(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
}