import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminApi from '../Axios/adminInstance';

interface AdminLoginResponse {
  email: string;
  success: boolean;
  message: string;
}

interface AdminState {
  email: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  email: null,
  loading: false,
  error: null,
};

// Login action
export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await adminApi.post<AdminLoginResponse>('/login', { email, password });
      console.log('Admin response received successfully:', response);
      return { email: response.data.email }; // Store the email here
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout action
export const adminLogout = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.post('/logout', {}, { withCredentials: true });
      console.log('Admin logout successful:', response);
      return true; // Logout successful
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.email = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.email = action.payload.email;  
        state.error = null;
        console.log('Admin login successful:', action.payload);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('Admin login failed:', state.error);
      })
      .addCase(adminLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.loading = false;
        state.email = null; // Clear admin email on logout
        state.error = null;
        console.log('Admin logout successful');
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.log('Admin logout failed:', state.error);
      });
  },
});

export const { clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;
