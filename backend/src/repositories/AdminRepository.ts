import { IAdminrepository } from "../interfaces/admin/adminRepositoryInterface";
import adminModel from "../models/Admin/adminModel";
import { IAdmin } from "../models/Admin/adminModel";


export class AdminRepository implements IAdminrepository {

    async findByEmail(email:string):Promise<IAdmin| null >{
        return await adminModel.findOne({email})
    }
}

 