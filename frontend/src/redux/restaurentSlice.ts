import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RestaurentState } from "../types/restaurent";

const initialState: RestaurentState = {
  restaurent: null,
  profile: null,
  role: null, // Initialize role as null
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
    setRestaurent: (state, action: PayloadAction<{ restaurent: any; role: string }>) => {
      state.restaurent = action.payload.restaurent; // Use lowercase `restaurent`
      state.role = action.payload.role; // Save the role
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
      state.role = null; // Reset role on logout
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