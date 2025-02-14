import { IManager } from "../../models/Manager/managerModel";

export interface IManagerRepository {
  findByEmail(email: string): Promise<IManager | null>;
  create(managerData: Partial<IManager>): Promise<IManager>;
  findAllPending(): Promise<IManager[]>;
  updateManagerStatus(managerId: string, isBlocked: boolean): Promise<IManager | null>;
  findById(managerId: string): Promise<IManager | null>;
  save(manager: IManager): Promise<IManager>;
  findAll(filter: any, skip: number, limit: number): Promise<any[]>;
  // Updated countAll method to accept optional search and filter parameters.
  countAll(filter: any): Promise<number>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
