import { IAdminService } from "../interfaces/admin/adminServiceInterface";
 import { IManagerRepository } from "../interfaces/manager/ManagerRepositoryInterface";
 import { UserRepositoryInterface } from "../interfaces/user/UserRepositoryInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
 import { IAdminrepository } from "../interfaces/admin/adminRepositoryInterface";

class AdminService implements IAdminService {
  

  constructor(private adminRepository:IAdminrepository ,private managerRepository:IManagerRepository,private userRepository:UserRepositoryInterface ) {
   
  }

  async adminLogin(email: string, password: string): Promise<{ admin: any; accessToken: string; refreshToken: string }> {
    console.log("Admin login request for email:", email);

    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      console.error("Admin not found for email:", email);
      throw new Error("Admin not found");
    }

    if (password !== admin.password) {
      console.error("Invalid password for admin:", email);
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const accessToken = generateAccessToken(admin._id.toString(), "admin");
    const refreshToken = generateRefreshToken(admin._id.toString(), "admin");

    console.log("Tokens generated successfully for admin:", admin._id.toString());

    return { admin, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);

      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        throw new Error("Invalid or malformed token");
      }

      const newAccessToken = generateAccessToken(decoded.userId, "admin");
      return { accessToken: newAccessToken };
    } catch (error: any) {
      throw new Error("Failed to refresh tokens");
    }
  }

  async getPendingManagers(): Promise<any> {
    return await this.managerRepository.findAllPending();
  }

  async updateManagerStatus(managerId: string, isBlocked: boolean,  blockReason?: string): Promise<any> {
    return await this.managerRepository.updateManagerStatus(managerId, isBlocked, blockReason);
  }

  // services/adminService.ts
  async getAllManagers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ managers: any[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter: any = {};
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    if (isBlocked === 'blocked') {
      filter.isBlocked = true;
    } else if (isBlocked === 'active') {
      filter.isBlocked = false;
    }
  
    const [managers, total] = await Promise.all([
      this.managerRepository.findAll(filter, skip, limit),
      this.managerRepository.countAll(filter),
    ]);
  
    return { managers, total };
  }


  async getAllUsers(page: number, limit: number,searchTerm: string,
    isBlocked: string): Promise<{ users: any[]; total: number }> {
    const skip = (page - 1) * limit;

     // Build filter query
     const filter: any = {};
     if (searchTerm) {
       filter.$or = [
         { name: { $regex: searchTerm, $options: 'i' } },
         { email: { $regex: searchTerm, $options: 'i' } }
       ];
     }
     if (isBlocked === 'blocked') {
       filter.isBlocked = true;
     } else if (isBlocked === 'active') {
       filter.isBlocked = false;
     }
    const [users, total] = await Promise.all([
      this.userRepository.findAll(filter,skip, limit),
      this.userRepository.countAll(filter),
    ]);
    return { users, total };
  }

  async managerBlock(managerId: string, isBlocked: boolean): Promise<any> {
    const manager = await this.managerRepository.findById(managerId);

    if (!manager) {
      throw new Error("Manager not found");
    }

    manager.isBlocked = isBlocked;
    const updatedManager = await this.managerRepository.save(manager);

    return updatedManager;
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
console.log('user is blocking bolean',isBlocked)
      user.isBlocked = isBlocked;
      const updatedUser=await this.userRepository.save(user) 
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default AdminService;
