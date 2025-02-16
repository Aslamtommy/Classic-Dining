import { IRestaurent } from "../../models/Restaurent/RestaurentModel";

export interface IRestaurentRepository {
  findByEmail(email: string): Promise<IRestaurent | null>;
  create(restaurentData: Partial<IRestaurent>): Promise<IRestaurent>;
  findAllPending(): Promise<IRestaurent[]>;
  updateRestaurentStatus( restaurentId: string,
    isBlocked: boolean,
    blockReason?: string): Promise<IRestaurent | null>;
  findById(restaurentId: string): Promise<IRestaurent | null>;
  save(restaurent: IRestaurent): Promise<IRestaurent>;
  findAll(filter: any, skip: number, limit: number): Promise<any[]>;
  // Updated countAll method to accept optional search and filter parameters.
  countAll(filter: any): Promise<number>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
