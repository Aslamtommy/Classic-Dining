import { IAdminService } from "../interfaces/admin/adminServiceInterface";
import { IRestaurentRepository } from "../interfaces/Restaurent/RestaurentRepositoryInterface";
import { UserRepositoryInterface } from "../interfaces/user/UserRepositoryInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { IAdminrepository } from "../interfaces/admin/adminRepositoryInterface";

class AdminService implements IAdminService {
  constructor(
    private adminRepository: IAdminrepository,
    private restaurentRepository: IRestaurentRepository,
    private userRepository: UserRepositoryInterface
  ) {}

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

    // Generate tokens by passing an object payload
    const accessToken = generateAccessToken({ id: admin._id.toString(), role: "admin" });
    const refreshToken = generateRefreshToken({ id: admin._id.toString(), role: "admin" });

    console.log("Tokens generated successfully for admin:", admin._id.toString());

    return { admin, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);

      // Check for the expected property "id" in the payload
      if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
        throw new Error("Invalid or malformed token");
      }

      // Generate a new access token using the decoded token's id and role "admin"
      const newAccessToken = generateAccessToken({ id: decoded.id, role: "admin" });
      return { accessToken: newAccessToken };
    } catch (error: any) {
      throw new Error("Failed to refresh tokens");
    }
  }

  async getPendingRestaurents(): Promise<any> {
    return await this.restaurentRepository.findAllPending();
  }

  async updateRestaurentStatus(restaurentId: string, isBlocked: boolean, blockReason?: string): Promise<any> {
    return await this.restaurentRepository.updateRestaurentStatus(restaurentId, isBlocked, blockReason);
  }

  async getAllRestaurents(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ restaurents: any[]; total: number }> {
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
  
    const [restaurents, total] = await Promise.all([
      this.restaurentRepository.findAll(filter, skip, limit),
      this.restaurentRepository.countAll(filter),
    ]);
  
    return { restaurents, total };
  }

  async getAllUsers(page: number, limit: number, searchTerm: string, isBlocked: string): Promise<{ users: any[]; total: number }> {
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
      this.userRepository.findAll(filter, skip, limit),
      this.userRepository.countAll(filter),
    ]);
    return { users, total };
  }

  async restaurentBlock(restaurentId: string, isBlocked: boolean): Promise<any> {
    const restaurent = await this.restaurentRepository.findById(restaurentId);

    if (!restaurent) {
      throw new Error("Restaurent not found");
    }

    restaurent.isBlocked = isBlocked;
    const updatedRestaurent = await this.restaurentRepository.save(restaurent);

    return updatedRestaurent;
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      console.log('User is blocking boolean:', isBlocked);
      user.isBlocked = isBlocked;
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default AdminService;
