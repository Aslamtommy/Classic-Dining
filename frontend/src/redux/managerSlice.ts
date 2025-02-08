import { createSlice, PayloadAction } from '@reduxjs/toolkit';
 

 
interface Manager {
  _id: string;   
  name: string;
  email: string;
  phone?: string;
  certificate?: string;   
}

interface ManagerState {
  manager: Manager | null;
  profile: Manager | null;
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  manager: null,
  profile: null,
  loading: false,
  error: null,
};

// Reducers for profile and error handling
const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
    },
    setManager: (state, action: PayloadAction<Manager>) => {
      state.manager = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<Manager>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logoutManager: (state) => {
      state.manager = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setManager, setProfile, setError, logoutManager } = managerSlice.actions;

export default managerSlice.reducer;
