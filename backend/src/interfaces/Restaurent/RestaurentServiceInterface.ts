import { IRestaurent} from "../../models/Restaurent/RestaurentModel";

export interface IForgotPasswordResponse {
  success: boolean;
  message: string;
  data: string | null;
}

export interface ILoginResponse {
  restaurent: IRestaurent;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface IResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface IRestaurentService {
  registerRestaurent(restaurentData: Partial<IRestaurent>): Promise<IRestaurent>;
  loginRestaurent(email: string, password: string): Promise<ILoginResponse>;
  getRestaurentProfile(restaurentId: string): Promise<IRestaurent | null>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  forgotPasswordVerify(email: string): Promise<IForgotPasswordResponse>;
  resetPassword(email: string, newPassword: string): Promise<IResetPasswordResponse>;
}
