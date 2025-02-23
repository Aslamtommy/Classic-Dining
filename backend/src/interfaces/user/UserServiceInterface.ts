import { IUser } from '../../models/User/userModel';
import { googleUserData } from '../../types/google';
 import { ForgotPasswordResponse } from '../../services/UserService';

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

 
  forgotPasswordVerify(email: string): Promise<ForgotPasswordResponse>;

 
  resetPassword(
    email: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }>;
  getUserProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    mobile_no: string;
    profilePicture: string;
  } | null>;
 
    uploadProfilePicture(userId: string, filePath: string): Promise<{ success: boolean; message: string; profilePicture?: string }>;
 
    updateUserProfile( userId: string,
      updateData: { name: string; email: string; mobile_no: string }
    ): Promise<any>;

    getBranchDetails(branchId: string):any
}
