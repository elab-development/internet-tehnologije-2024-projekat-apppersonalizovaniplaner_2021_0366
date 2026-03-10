import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LoadingProvider } from './contexts/LoadingProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <BrowserRouter>
       <LoadingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
     </StrictMode>
);
