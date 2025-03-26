 
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
 

interface Restaurent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  certificate?: string;
  accessToken?: string; 
  refreshToken?: string; 
  [key: string]: any;  
}

export interface RestaurentState {
  restaurent: Restaurent | null;
  profile: any | null;  
  role: string | null; 
  loading: boolean;
  error: string | null;
}

const initialState: RestaurentState = {
  restaurent: null,
  profile: null,
  role: null,
  loading: false,
  error: null,
};

const restaurentSlice = createSlice({
  name: "restaurent",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    clearLoading: (state) => {
      state.loading = false;
    },
    setRestaurent: (
      state,
      action: PayloadAction<any>
    ) => {
      state.restaurent = {
        ...action.payload.restaurent,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
      state.role = action.payload.role;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logoutRestaurent: (state) => {
      state.restaurent = null;
      state.profile = null;
      state.role = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  clearLoading,
  setRestaurent,
  setProfile,
  setError,
  logoutRestaurent,
} = restaurentSlice.actions;

export default restaurentSlice.reducer;