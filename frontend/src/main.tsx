import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import App from './App';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <Toaster />
          <App />
        </LoadScript>
      </PersistGate>
    </Provider>
  </StrictMode>
);