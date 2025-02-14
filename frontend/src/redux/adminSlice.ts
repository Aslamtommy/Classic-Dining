import { createSlice } from '@reduxjs/toolkit';

 
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

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminLogin: (state, action) => {
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;
    },
    adminLogout: (state) => {
      state.email = null;
      state.loading = false;
      state.error = null;
    },
    clearAdminState: (state) => {
      state.email = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { adminLogin, adminLogout, clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;