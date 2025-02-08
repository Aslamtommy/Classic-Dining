import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OtpState {
  email: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  loading: boolean;
  error: string | null;
  otpExpired: boolean;
}

const initialState: OtpState = {
  email: null,
  otpSent: false,
  otpVerified: false,
  loading: false,
  error: null,
  otpExpired: false,
};
const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    setOtpSent: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
      state.otpSent = true;
      state.loading = true;
    },
    setOtpVerified: (state) => {
      state.otpVerified = true;
      state.loading = false;
    },
    setOtpExpired(state) {
      state.otpExpired = true;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setOtpExpired,
  setOtpSent,
  setOtpVerified,
  setError,
} = otpSlice.actions;
export default otpSlice.reducer;
