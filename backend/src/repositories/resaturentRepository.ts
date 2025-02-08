 import   {Restaurant} from '../models/Restaurent/restaurentModel'

export class RestaurentRepository{

     findById = async (id: string): Promise<Restaurant | null> => {
        return await Restaurant.findById(id);
      };

}



 
