import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Restaurent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  certificate?: string;
  role?: "restaurent" | "branch";  
  parentRestaurantId?: string;  
}

interface RestaurentState {
  restaurent: Restaurent | null;
  profile: Restaurent | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurentState = {
  restaurent: null,
  profile: null,
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
    setRestaurent: (state, action: PayloadAction<Restaurent>) => {
      state.restaurent = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<Restaurent>) => {
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
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setRestaurent, setProfile, setError, logoutRestaurent } =
  restaurentSlice.actions;

export default restaurentSlice.reducer;