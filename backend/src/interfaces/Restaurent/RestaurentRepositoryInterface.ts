// src/interfaces/Restaurent/RestaurentRepositoryInterface.ts
import { IRestaurent } from "../../models/Restaurent/restaurentModel";
import { FilterQuery } from 'mongoose' 

export interface IRestaurentRepository {
  findByEmail(email: string): Promise<IRestaurent | null>;
  create(restaurentData: Partial<IRestaurent>): Promise<IRestaurent>;
  findAllPending(filter: FilterQuery<IRestaurent>, skip: number, limit: number): Promise<IRestaurent[]>;
  updateRestaurentStatus(restaurentId: string, isBlocked: boolean, blockReason?: string): Promise<IRestaurent | null>;
  findById(restaurentId: string): Promise<IRestaurent | null>;
  save(restaurent: IRestaurent): Promise<IRestaurent>;
  findAll(filter: FilterQuery<IRestaurent>, skip: number, limit: number): Promise<IRestaurent[]>;
  countAll(filter: FilterQuery<IRestaurent>): Promise<number>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  countAllPending(filter: FilterQuery<IRestaurent>): Promise<number>;
  addBranchToRestaurant(restaurentId: string, branchId: string): Promise<void>;
  removeBranchFromRestaurant(restaurentId: string, branchId: string): Promise<void>;
}