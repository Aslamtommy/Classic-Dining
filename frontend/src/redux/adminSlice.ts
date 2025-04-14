// src/redux/adminSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface AdminState {
  _id: string | null;
  email: string | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  _id: null,
  email: null,
  accessToken: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminLogin: (state, action) => {
      console.log('adminLogin action payload:', action.payload); // Debug
      state._id = action.payload._id;
      state.accessToken = action.payload.accessToken;
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;
    },
    adminLogout: (state) => {
      state._id = null;
      state.email = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
    clearAdminState: (state) => {
      state._id = null;
      state.email = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { adminLogin, adminLogout, clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;