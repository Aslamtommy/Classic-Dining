import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 
interface User {
  
  name: string;
  email: string;
  profilePicture?: string | null; 
  accessToken?: string;
}

 
interface UserState {
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
      state.loading = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;  
    },
    setError: (state, action: PayloadAction<string>) => {
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
        state.user.profilePicture = action.payload 
      }
    },
  },
});

export const { setLoading, setUser, setError, logoutUser, updateProfilePicture } = userSlice.actions;
export default userSlice.reducer;
