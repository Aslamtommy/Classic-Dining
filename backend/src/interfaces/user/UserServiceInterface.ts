import { IUser } from '../../models/User/userModel';
import { googleUserData } from '../../types/google';
 

export interface IUserService {
 
  registerUser(
    name: string,
    email: string,
    password: string,
    mobile_no: string,
  ): Promise<IUser>;

   
  authenticateUser(
    email: string,
    password: string,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;

 
  googleSignIn(
    userData: googleUserData,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
 
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

 
  forgotPasswordVerify(email: string): Promise<string>;

 
  resetPassword(
    email: string,
    newPassword: string,
  ): Promise<void>;
  getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    profilePicture: string;
  } | null>;
 
    uploadProfilePicture(userId: string, filePath: string): Promise<    string>;
 
    updateUserProfile( userId: string,
      updateData: { name: string; email: string; mobile: string }
    ): Promise<any>;

    getBranchDetails(branchId: string):any;

    
    getAllBranches(search: string , page: number  , limit: number ):any
}
