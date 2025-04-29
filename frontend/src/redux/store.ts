import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './userslice';
import otpReducer from './otpslice';
import adminReducer from './adminSlice';
import restaurentReducer from './restaurentSlice';
import locationReducer from './locationSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

// Persist config for each reducer
const userPersistConfig = {
  key: 'user',
  storage,
};

const locationPersistConfig = {
  key: 'location',
  storage,
};

const adminPersistConfig = {
  key: 'admin',
  storage,
};

const restaurentPersistConfig = {
  key: 'restaurent',
  storage,
};

// Combine reducers with individual persistence
const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  location: persistReducer(locationPersistConfig, locationReducer),
  otp: otpReducer, // Not persisted
  admin: persistReducer(adminPersistConfig, adminReducer),
  restaurent: persistReducer(restaurentPersistConfig, restaurentReducer),
});

// Root persist config (optional, for combining persisted reducers)
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'location', 'admin', 'restaurent'],
};

// Create the persisted reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };

// Define RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;