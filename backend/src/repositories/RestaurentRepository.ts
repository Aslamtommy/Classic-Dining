import   { IRestaurent} from '../models/Restaurent/RestaurentModel';
import { IRestaurentRepository} from '../interfaces/Restaurent/RestaurentRepositoryInterface';
import RestaurentModel from '../models/Restaurent/RestaurentModel';
export class RestaurentRepository implements IRestaurentRepository {

  
  // Find restaurent  by email
  public async findByEmail(email: string): Promise<IRestaurent| null> {
    return RestaurentModel.findOne({ email });
  }

  // Create a new restaurent 
  public async create(restaurentData: Partial<IRestaurent>): Promise<IRestaurent> {
    return RestaurentModel.create(restaurentData);
  }

  async findAllPending(): Promise<IRestaurent[]> {
    return RestaurentModel.find({ isBlocked: true });
  }

  // Update restaurent 's approval status
  async updateRestaurentStatus(
    restaurentId: string,
    isBlocked: boolean,
    blockReason?: string // Add blockReason parameter
  ): Promise<IRestaurent| null> {
    return RestaurentModel.findByIdAndUpdate(
      restaurentId,
      {
        isBlocked,
       
        ...(isBlocked && { blockReason }),
        // Clear blockReason when unblocking (optional)
        ...(!isBlocked && { blockReason: null }),
      },
      { new: true }
    );
  }
async findById(restaurentId:string):Promise<any>{
  return   RestaurentModel.findById(restaurentId)
}

 
async save(restaurent: IRestaurent): Promise<IRestaurent> {
  return await restaurent.save();   
}
// repositories/restaurent Repository.ts
async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
  return await RestaurentModel.find(filter)
    .skip(skip)
    .limit(limit)
    .exec();
}

async countAll(filter: any): Promise<number> {
  return await RestaurentModel.countDocuments(filter);
}


   async updatePassword(userId: string, hashedPassword: string): Promise<void> {
     try {
       const user = await RestaurentModel.findById(userId);
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
 
