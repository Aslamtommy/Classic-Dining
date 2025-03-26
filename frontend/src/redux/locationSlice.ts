import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  lat: number | null;
  lng: number | null;
  locationName: string | null; // Added to store the readable location name
}

const initialState: LocationState = {
  lat: null,
  lng: null,
  locationName: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{ lat: number; lng: number; locationName?: string }>
    ) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.locationName = action.payload.locationName || null; // Optional locationName
    },
    clearLocation: (state) => {
      state.lat = null;
      state.lng = null;
      state.locationName = null; // Clear location name as well
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;