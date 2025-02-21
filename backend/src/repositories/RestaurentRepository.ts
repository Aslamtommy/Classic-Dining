import   { IRestaurent} from '../models/Restaurent/RestaurentModel';
import { IRestaurentRepository} from '../interfaces/Restaurent/RestaurentRepositoryInterface';
import RestaurentModel from '../models/Restaurent/RestaurentModel';
export class RestaurentRepository implements IRestaurentRepository {

  
  // Find restaurent  by email
  public async findByEmail(email: string): Promise<IRestaurent| null> {
    return RestaurentModel.findOne({ email }).lean()
  }

  // Create a new restaurent 
  public async create(restaurentData: Partial<IRestaurent>): Promise<IRestaurent> {
    return RestaurentModel.create(restaurentData);
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

   async addBranchToRestaurant(restaurantId: string, branchId: string): Promise<IRestaurent | null> {
    return RestaurentModel.findByIdAndUpdate(
      restaurantId,
      { $push: { branches: branchId } }, // Add branch ID to branches array
      { new: true }
    );
  }
    // Remove branch from restaurant
    async removeBranchFromRestaurant(restaurantId: string, branchId: string): Promise<IRestaurent | null> {
      return RestaurentModel.findByIdAndUpdate(
        restaurantId,
        { $pull: { branches: branchId } }, // Remove branch ID from branches array
        { new: true }
      );
    }
    // Add these repository methods
async findAllPending(filter: any, skip: number, limit: number): Promise<any> {
  return RestaurentModel.find(filter)
      .skip(skip)
      .limit(limit)
      .lean();
}

async countAllPending(filter: any): Promise<number> {
  return RestaurentModel.countDocuments(filter);
}

}
 
