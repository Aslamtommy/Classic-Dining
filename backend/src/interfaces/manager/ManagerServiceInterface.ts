import { IManager } from "../../models/Manager/managerModel";

export interface IForgotPasswordResponse {
  success: boolean;
  message: string;
  data: string | null;
}

export interface ILoginResponse {
  manager: IManager;
  accessToken: string;
  refreshToken: string;
}

export interface IResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface IManagerService {
  registerManager(managerData: Partial<IManager>): Promise<IManager>;
  loginManager(email: string, password: string): Promise<ILoginResponse>;
  getManagerProfile(managerId: string): Promise<IManager | null>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse>;
  resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse>;
}
