import { Suspense } from 'react';
import AppRouter from './router';
import { Toaster } from 'sonner';
import { AuthProvider } from "./context/AuthContext.tsx";

const App = () => {
  return (
    <>
    <Toaster richColors position="top-center" closeButton={true} />
    <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>

        <AppRouter />
          </AuthProvider>

    </Suspense>
  </>
  );
};

export default App;
