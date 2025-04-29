import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearLocation } from './locationSlice';

interface User {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string | null;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state) => {
      console.log("Current state before setting loading:", state);
      if (!state) return;
      state.loading = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = {
        ...action.payload,
        accessToken: action.payload.accessToken || state.user?.accessToken,
        refreshToken: action.payload.refreshToken || state.user?.refreshToken,
      };
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      console.log("Error setting state:", state);
      if (!state) return;
      state.error = action.payload;
      state.loading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      // Clear persisted user and location data from localStorage
      localStorage.removeItem('persist:user');
      localStorage.removeItem('persist:location');
    },
    updateProfilePicture: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.profilePicture = action.payload;
      }
    },
  },
});

export const { setLoading, setUser, setError, logoutUser, updateProfilePicture } = userSlice.actions;
export default userSlice.reducer;