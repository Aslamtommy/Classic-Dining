import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store' 
import App from './App';
import { Provider } from 'react-redux';

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
