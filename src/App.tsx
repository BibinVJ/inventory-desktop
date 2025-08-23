import { Suspense } from 'react';
import { Toaster } from 'sonner';
import AuthWrapper from './components/AuthWrapper';
import "nprogress/nprogress.css";
import "./nprogress-custom.css";

const App = () => {
  return (
    <>
      <Toaster richColors position="top-center" closeButton={true} />
      <Suspense fallback={<div>Loading...</div>}>
        <AuthWrapper />
      </Suspense>
    </>
  );
};

export default App;
