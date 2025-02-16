import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './userslice';
import otpReducer from './otpslice';
import adminReducer from './adminSlice';
import restaurentReducer from './restaurentSlice'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage' 
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

// Persist config for user data and admin data
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'admin','restaurent'],  
};

// Combine all reducers into a rootReducer
const rootReducer = combineReducers({
  user: userReducer,
  otp: otpReducer,
  admin: adminReducer,
  restaurent:restaurentReducer
 
});

 
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer, 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

// Create the persistor for redux-persist
const persistor = persistStore(store);

export { store, persistor };

// Define RootState and AppDispatch for type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;  
