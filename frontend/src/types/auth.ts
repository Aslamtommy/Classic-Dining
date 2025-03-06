 
export interface User {
  _id:string
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string | null;
  accessToken?: string;
  isBlocked: boolean;
}


 

export  interface FetchUsersResponse {
  users: User[];
  total: number;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: {
    user: User;
  };
}

export interface GoogleSignInResponse {
  status: number;
  message: string;
  data: User;
}

export interface SignupFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
}

export interface SignupResponse {
  status: number;
  message: string;
  data: {
    user: User;
  };
}

export interface ProfileResponse {
  status: number;
  message: string;
  data: User;
}

export interface UpdateProfileResponse {
  status: number;
  message: string;
  data: User;
}

export interface ProfilePictureResponse {
  status: number;
  message: string;
  data: {
    profilePicture: string;
  };
}

export interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}