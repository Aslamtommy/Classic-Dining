import ManagerModel, { IManager } from '../models/Manager/managerModel';
import { IManagerRepository } from '../interfaces/manager/ManagerRepositoryInterface';
export class ManagerRepository implements IManagerRepository {

  
  // Find manager by email
  public async findByEmail(email: string): Promise<IManager | null> {
    return ManagerModel.findOne({ email });
  }

  // Create a new manager
  public async create(managerData: Partial<IManager>): Promise<IManager> {
    return ManagerModel.create(managerData);
  }

  async findAllPending(): Promise<IManager[]> {
    return ManagerModel.find({ isBlocked: true });
  }

  // Update manager's approval status
  async updateManagerStatus(
    managerId: string,
    isBlocked: boolean,
    blockReason?: string // Add blockReason parameter
  ): Promise<IManager | null> {
    return ManagerModel.findByIdAndUpdate(
      managerId,
      {
        isBlocked,
       
        ...(isBlocked && { blockReason }),
        // Clear blockReason when unblocking (optional)
        ...(!isBlocked && { blockReason: null }),
      },
      { new: true }
    );
  }
async findById(managerId:string):Promise<any>{
  return   ManagerModel.findById(managerId)
}

 
async save(manager: IManager): Promise<IManager> {
  return await manager.save();   
}
// repositories/managerRepository.ts
async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
  return await ManagerModel.find(filter)
    .skip(skip)
    .limit(limit)
    .exec();
}

async countAll(filter: any): Promise<number> {
  return await ManagerModel.countDocuments(filter);
}


   async updatePassword(userId: string, hashedPassword: string): Promise<void> {
     try {
       const user = await ManagerModel.findById(userId);
       if (user) {
         user.password = hashedPassword;
         await user.save();
       } else {
         throw new Error('User not found');
       }
     } catch (error) {
       throw new Error('Error updating password');
     }
   }



}
 
