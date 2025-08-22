import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <ThemeProvider> */}
        {/* <AuthProvider> */}
          <App />
        {/* </AuthProvider> */}
    {/* </ThemeProvider> */}
  </StrictMode>,
);
