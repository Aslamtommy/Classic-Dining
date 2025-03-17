// src/redux/userslice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string | null;
  accessToken?: string; // Already present but ensure it’s used
  refreshToken?: string; // Add refreshToken
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
        // Ensure tokens are included if provided
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
      localStorage.removeItem('userProfile');
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